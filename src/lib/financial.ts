import type { SimulatorState, MonthlyProjection } from '@/types/simulator';

export function calculateProjections(state: SimulatorState): MonthlyProjection[] {
  const months: MonthlyProjection[] = [];
  const { commercial, matrixClients, churn, revenueRules, taxes, fixedCosts, variableCostRates, belowEbitda } = state;

  let mrrAcumulado = 0;
  let clientesAcum = 0;

  for (let m = 1; m <= state.horizonte; m++) {
    // --- Matrix clients ---
    let clientesMes = matrixClients.qtdMensalInicial;
    if (m > 1) {
      if (matrixClients.tipoCresc === 'incremental') {
        clientesMes = matrixClients.qtdMensalInicial + matrixClients.incremClientes * (m - 1);
      } else if (matrixClients.tipoCresc === 'percentage') {
        clientesMes = Math.round(matrixClients.qtdMensalInicial * Math.pow(1 + matrixClients.percCresc / 100, m - 1));
      }
    }
    clientesAcum += clientesMes;
    const setupMatriz = clientesMes * matrixClients.setupPorCliente;
    const novoMrrMatriz = clientesMes * matrixClients.mrrPorCliente;
    const cacTotal = clientesMes * matrixClients.cacPorCliente;

    // --- Own sales revenue ---
    const mix = commercial.mix;
    const tickets = commercial.tickets;
    const tSetup = tickets.find(t => t.key === 'setup')?.valor || 0;
    const tCaas = tickets.find(t => t.key === 'caas')?.valor || 0;
    const tSaas = tickets.find(t => t.key === 'saas')?.valor || 0;
    const tDiag = tickets.find(t => t.key === 'diagnostico')?.valor || 0;

    const recSetup = mix.setup * tSetup;
    const recCaas = mix.caas * tCaas;
    const recSaasTotal = mix.saas * tSaas;
    const recSaasReconhecida = recSaasTotal * (revenueRules.revenueShareSaaS / 100);
    const recDiag = mix.diagnostico * tDiag;

    // Map to plan accounts
    const map = revenueRules.mapeamento;
    let rbCaas = recCaas;
    let rbSaas = recSaasReconhecida;
    let rbEducation = 0;
    let rbExpansao = 0;
    let rbTax = 0;

    // Setup mapping
    if (map.setup === 'expansao') rbExpansao += recSetup + setupMatriz;
    else if (map.setup === 'education') rbEducation += recSetup + setupMatriz;
    else rbExpansao += recSetup + setupMatriz;

    // Diagnostico mapping
    if (map.diagnostico === 'expansao') rbExpansao += recDiag;
    else if (map.diagnostico === 'education') rbEducation += recDiag;
    else rbExpansao += recDiag;

    // --- MRR with churn ---
    const mrrInicial = mrrAcumulado;
    const churnValor = mrrInicial * (churn.churnMensal / 100);
    const novoMrrOwn = mix.caas * tCaas; // CAAS is recurring
    const novoMrrTotal = novoMrrMatriz + (m === 1 ? novoMrrOwn : 0); // Own MRR only starts month 1 initial
    // Actually, own CAAS is monthly recurring, so it adds every month from own sales
    // Let's simplify: own CAAS MRR adds each month from new sales
    const mrrFinal = mrrInicial - churnValor + novoMrrMatriz + recSaasReconhecida;
    // Add CAAS as recurring
    // For simplicity: MRR = CAAS monthly + SaaS rev share + matrix MRR accumulated with churn

    // Let me recalculate MRR properly:
    // MRR base = previous month final
    // New MRR = matrix clients MRR (new this month) 
    // Churn applies to base
    // Own CAAS and SaaS revenue are monthly (not accumulated in MRR base for now, they repeat each month)
    
    const mrrFinalCalc = mrrInicial - churnValor + novoMrrMatriz;
    mrrAcumulado = mrrFinalCalc;

    // Add MRR to CAAS revenue (matrix clients' recurring)
    rbCaas += mrrFinalCalc; // Matrix MRR goes into CAAS line

    const receitaBrutaTotal = rbCaas + rbSaas + rbEducation + rbExpansao + rbTax;

    // --- Deductions (taxes) ---
    let deducoes = 0;
    const revenueByProduct: Record<string, number> = {
      caas: rbCaas, saas: rbSaas, education: rbEducation, expansao: rbExpansao, tax: rbTax,
    };
    for (const imposto of taxes.impostos) {
      if (imposto.aliquota <= 0) continue;
      for (const [prod, receita] of Object.entries(revenueByProduct)) {
        if (imposto.aplicaA[prod as keyof typeof imposto.aplicaA]) {
          deducoes += receita * (imposto.aliquota / 100);
        }
      }
    }

    const receitaLiquida = receitaBrutaTotal - deducoes;

    // --- Variable costs ---
    const royaltiesValor = receitaBrutaTotal * (revenueRules.royalties / 100);
    const custosCaas = variableCostRates.find(c => c.key === 'caas')?.valorMensal || 0;
    const custosSaas = variableCostRates.find(c => c.key === 'saas')?.valorMensal || 0;
    const custosEducation = variableCostRates.find(c => c.key === 'education')?.valorMensal || 0;
    const custosCS = variableCostRates.find(c => c.key === 'cs')?.valorMensal || 0;
    const custosExpansao = variableCostRates.find(c => c.key === 'expansao')?.valorMensal || 0;
    const custosTax = variableCostRates.find(c => c.key === 'tax')?.valorMensal || 0;
    const custosVariaveisTotal = custosCaas + custosSaas + custosEducation + custosCS + custosExpansao + custosTax + royaltiesValor + cacTotal;

    const lucroBruto = receitaLiquida - custosVariaveisTotal;
    const margemBruta = receitaBrutaTotal > 0 ? (lucroBruto / receitaBrutaTotal) * 100 : 0;

    // --- Fixed expenses ---
    const despMarketing = fixedCosts.find(c => c.key === 'marketing')?.valorMensal || 0;
    const despComerciais = fixedCosts.find(c => c.key === 'comerciais')?.valorMensal || 0;
    const despPessoal = fixedCosts.find(c => c.key === 'pessoal')?.valorMensal || 0;
    const despAdm = fixedCosts.find(c => c.key === 'administrativas')?.valorMensal || 0;
    const despFixasTotal = despMarketing + despComerciais + despPessoal + despAdm;

    const ebitda = lucroBruto - despFixasTotal;
    const margemEbitda = receitaBrutaTotal > 0 ? (ebitda / receitaBrutaTotal) * 100 : 0;

    // --- Below EBITDA ---
    const resultadoLiquido = ebitda + belowEbitda.recFinanceiras - belowEbitda.despFinanceiras
      + belowEbitda.outrasReceitas - belowEbitda.despNaoOperacionais - belowEbitda.provisaoIRCSLL;

    const resultadoFinal = resultadoLiquido - belowEbitda.amortizacao - belowEbitda.investimentosMensal;

    months.push({
      month: m,
      receitaBrutaCaas: rbCaas,
      receitaBrutaSaas: rbSaas,
      receitaBrutaEducation: rbEducation,
      receitaBrutaExpansao: rbExpansao,
      receitaBrutaTax: rbTax,
      receitaBrutaTotal,
      deducoes,
      receitaLiquida,
      custosCaas, custosSaas, custosEducation, custosCS, custosExpansao, custosTax,
      royaltiesValor,
      cacTotal,
      custosVariaveisTotal,
      lucroBruto,
      margemBruta,
      despMarketing, despComerciais, despPessoal, despAdm, despFixasTotal,
      ebitda,
      margemEbitda,
      recFinanceiras: belowEbitda.recFinanceiras,
      despFinanceiras: belowEbitda.despFinanceiras,
      outrasReceitas: belowEbitda.outrasReceitas,
      despNaoOperacionais: belowEbitda.despNaoOperacionais,
      provisaoIRCSLL: belowEbitda.provisaoIRCSLL,
      resultadoLiquido,
      amortizacao: belowEbitda.amortizacao,
      investimentos: belowEbitda.investimentosMensal,
      resultadoFinal,
      mrrInicial,
      churnValor,
      novoMrr: novoMrrMatriz,
      mrrFinal: mrrFinalCalc,
      clientesCompradosMes: clientesMes,
      clientesCompradosAcum: clientesAcum,
      setupMatriz,
    });
  }

  return months;
}

export function calculateROI(investment: { taxaFranquia: number; capitalGiro: number; implantacao: number; marketingInicial: number; equipamentos: number; outros: number }, projections: MonthlyProjection[]) {
  const totalInvestimento = investment.taxaFranquia + investment.capitalGiro + investment.implantacao
    + investment.marketingInicial + investment.equipamentos + investment.outros;
  
  if (totalInvestimento === 0 || projections.length === 0) {
    return { totalInvestimento, roiAnual: 0, paybackMeses: 0 };
  }

  const resultadoAnual = projections.slice(0, 12).reduce((s, p) => s + p.resultadoFinal, 0);
  const roiAnual = (resultadoAnual / totalInvestimento) * 100;

  const mediaMensal = projections.reduce((s, p) => s + p.resultadoFinal, 0) / projections.length;
  const paybackMeses = mediaMensal > 0 ? Math.ceil(totalInvestimento / mediaMensal) : 0;

  return { totalInvestimento, roiAnual, paybackMeses };
}
