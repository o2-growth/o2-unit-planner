import type { SimulatorState, MonthlyProjection, InvestmentData } from '@/types/simulator';

export function calculateProjections(state: SimulatorState): MonthlyProjection[] {
  const months: MonthlyProjection[] = [];
  const { commercial, matrixClients, churn, revenueRules, taxes, variableCostRates, fixedCosts, belowEbitda } = state;

  const tCaas = commercial.tickets.find(t => t.key === 'caas')?.valor || 0;
  const tSaas = commercial.tickets.find(t => t.key === 'saas')?.valor || 0;
  const tSetup = commercial.tickets.find(t => t.key === 'setup')?.valor || 0;
  const tDiag = commercial.tickets.find(t => t.key === 'diagnostico')?.valor || 0;

  const mix = commercial.mix;
  const churnRate = churn.churnMensal / 100;
  const revShare = revenueRules.revenueShareSaaS / 100;
  const royaltiesRate = revenueRules.royalties / 100;

  // Variable cost rates
  const getRate = (arr: typeof variableCostRates, key: string) => (arr.find(c => c.key === key)?.percentual || 0) / 100;
  const custoCaasRate = getRate(variableCostRates, 'caas');
  const custoSaasRate = getRate(variableCostRates, 'saas');
  const custoEdRate = getRate(variableCostRates, 'education');
  const custoCSRate = getRate(variableCostRates, 'cs');
  const custoExpRate = getRate(variableCostRates, 'expansao');
  const custoTaxRate = getRate(variableCostRates, 'tax');

  // Fixed cost rates
  const mktRate = getRate(fixedCosts, 'marketing');
  const comRate = getRate(fixedCosts, 'comerciais');
  const admRate = getRate(fixedCosts, 'administrativas');

  // Tax configs
  const getTaxRate = (key: string) => (taxes.impostos.find(t => t.key === key)?.aliquota || 0) / 100;
  const getTaxConfig = (key: string) => taxes.impostos.find(t => t.key === key);

  let mrrCaasOwn = 0;
  let mrrSaasOwn = 0;
  let mrrMatriz = 0;
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

    // --- Apply churn to accumulated MRR ---
    const totalMrrBefore = mrrCaasOwn + mrrSaasOwn + mrrMatriz;
    const churnValor = totalMrrBefore * churnRate;
    if (totalMrrBefore > 0) {
      const factor = 1 - churnRate;
      mrrCaasOwn *= factor;
      mrrSaasOwn *= factor;
      mrrMatriz *= factor;
    }

    // --- Add new recurring MRR ---
    mrrCaasOwn += mix.caas * tCaas;           // CAAS: 100% franqueado, recorrente
    mrrSaasOwn += mix.saas * tSaas * revShare; // SAAS: só revenue share (30%), recorrente
    mrrMatriz += novoMrrMatriz;

    // --- Pontual revenue (não acumula) ---
    const setupOwn = (mix.caas + mix.saas) * tSetup;  // Setup: pontual
    const recDiag = mix.diagnostico * tDiag;            // Diagnóstico: pontual

    // --- Receita pré-existente (mês 1 only) ---
    const receitaPreExistente = state.profile.receitaMensal;

    // --- DRE Revenue Lines ---
    const rbCaas = mrrCaasOwn + mrrMatriz + receitaPreExistente;
    const rbSaas = mrrSaasOwn + setupOwn;  // SAAS + Setup own na mesma linha
    const rbEducation = 0;
    const rbExpansao = recDiag + setupMatriz;
    const rbTax = 0;
    const receitaBrutaTotal = rbCaas + rbSaas + rbEducation + rbExpansao + rbTax;

    // --- Deductions per tax (excluding IRPJ/CSLL → post-EBITDA) ---
    const revenueByProduct: Record<string, number> = {
      caas: rbCaas, saas: rbSaas, setup: setupOwn, education: rbEducation, expansao: rbExpansao, tax: rbTax,
    };

    const calcTaxDed = (key: string): number => {
      const cfg = getTaxConfig(key);
      if (!cfg) return 0;
      let total = 0;
      for (const [prod, receita] of Object.entries(revenueByProduct)) {
        const rate = cfg.aplicaA[prod as keyof typeof cfg.aplicaA] || 0;
        if (rate > 0) {
          total += receita * (rate / 100);
        }
      }
      return total;
    };

    const deducaoPIS = calcTaxDed('pis');
    const deducaoCOFINS = calcTaxDed('cofins');
    const deducaoISSQN = calcTaxDed('issqn');
    const deducaoICMS = calcTaxDed('icms');
    const deducoesTotal = deducaoPIS + deducaoCOFINS + deducaoISSQN + deducaoICMS;

    const receitaLiquida = receitaBrutaTotal - deducoesTotal;

    // --- Variable costs (% based) ---
    const custosCaas = rbCaas * custoCaasRate;
    const custosSaas = rbSaas * custoSaasRate;
    const custosEducation = rbEducation * custoEdRate;
    const csEffective = receitaBrutaTotal >= 500000 ? Math.max(custoCSRate, 0.02) : custoCSRate;
    const custosCS = receitaBrutaTotal * csEffective;
    const custosExpansao = rbExpansao * custoExpRate;
    const custosTax = rbTax * custoTaxRate;
    const royaltiesValor = receitaBrutaTotal * royaltiesRate;
    const custosVariaveisTotal = custosCaas + custosSaas + custosEducation + custosCS + custosExpansao + custosTax + royaltiesValor + cacTotal;

    const lucroBruto = receitaLiquida - custosVariaveisTotal;
    const margemBruta = receitaBrutaTotal > 0 ? (lucroBruto / receitaBrutaTotal) * 100 : 0;

    // --- Fixed expenses ---
    const despMarketing = receitaBrutaTotal * mktRate;
    const despComerciais = receitaBrutaTotal * comRate;
    const despPessoal = m <= 12 ? (state.goals.proLaboreDesejado || 0) : (state.goals.proLabore12m || 0);
    const despAdm = receitaBrutaTotal < 100000 ? 6000 : receitaBrutaTotal * admRate;
    const despFixasTotal = despMarketing + despComerciais + despPessoal + despAdm;

    const ebitda = lucroBruto - despFixasTotal;
    const margemEbitda = receitaBrutaTotal > 0 ? (ebitda / receitaBrutaTotal) * 100 : 0;

    // --- Below EBITDA ---
    // IRPJ/CSLL: calculated on revenue (same logic as deductions, but post-EBITDA)
    let irpjCsll = 0;
    if (ebitda > 0) {
      irpjCsll = calcTaxDed('irpj') + calcTaxDed('csll');
    }

    const recFinanceiras = receitaBrutaTotal * (belowEbitda.recFinanceirasPercent / 100);
    const despFinanceiras = receitaBrutaTotal * (belowEbitda.despFinanceirasPercent / 100);
    const amortizacaoMes = belowEbitda.amortizacaoPMT;

    const resultadoLiquido = ebitda + recFinanceiras - despFinanceiras - irpjCsll;
    const resultadoFinal = resultadoLiquido - amortizacaoMes - belowEbitda.investimentosMensal;

    months.push({
      month: m,
      receitaPreExistente,
      receitaBrutaCaas: rbCaas,
      receitaBrutaSaas: rbSaas,
      receitaBrutaEducation: rbEducation,
      receitaBrutaExpansao: rbExpansao,
      receitaBrutaTax: rbTax,
      receitaBrutaTotal,
      receitaSetupPontual: setupOwn,
      receitaDiagPontual: recDiag,
      deducaoPIS, deducaoCOFINS, deducaoISSQN, deducaoICMS,
      deducoesTotal,
      receitaLiquida,
      custosCaas, custosSaas, custosEducation, custosCS, custosExpansao, custosTax,
      royaltiesValor, cacTotal, custosVariaveisTotal,
      lucroBruto, margemBruta,
      despMarketing, despComerciais, despPessoal, despAdm, despFixasTotal,
      ebitda, margemEbitda,
      recFinanceiras,
      despFinanceiras,
      irpjCsll,
      resultadoLiquido,
      amortizacao: amortizacaoMes,
      investimentos: belowEbitda.investimentosMensal,
      resultadoFinal,
      mrrCaasOwn, mrrSaasOwn, mrrMatriz,
      mrrTotal: mrrCaasOwn + mrrSaasOwn + mrrMatriz,
      churnValor,
      clientesCompradosMes: clientesMes,
      clientesCompradosAcum: clientesAcum,
      setupMatriz,
    });
  }

  return months;
}

export function calculateCapitalGiro(projections: MonthlyProjection[], investment: InvestmentData): number {
  let prejuizoAcum = 0;
  for (const p of projections) {
    if (p.resultadoFinal < 0) {
      prejuizoAcum += Math.abs(p.resultadoFinal);
    } else {
      break;
    }
  }
  return prejuizoAcum + investment.implantacao + investment.marketingInicial + investment.equipamentos + investment.outros;
}

export function calculateROI(investment: InvestmentData, projections: MonthlyProjection[]) {
  const taxaFinal = investment.cupomAplicado ? 140000 : investment.taxaFranquia;
  const capitalGiro = calculateCapitalGiro(projections, investment);
  const totalInvestimento = taxaFinal + capitalGiro;

  if (projections.length === 0) {
    return { totalInvestimento, capitalGiro, roiDireto: 0, roiTotal: 0, paybackMeses: 0, taxaFinal };
  }

  const resultadoAnual = projections.slice(0, 12).reduce((s, p) => s + p.resultadoFinal, 0);
  const roiDireto = taxaFinal > 0 ? (resultadoAnual / taxaFinal) * 100 : 0;
  const roiTotal = totalInvestimento > 0 ? (resultadoAnual / totalInvestimento) * 100 : 0;

  // Payback fracionado (2 decimais)
  let acum = 0;
  let paybackMeses = 0;
  for (let i = 0; i < projections.length; i++) {
    const prev = acum;
    acum += projections[i].resultadoFinal;
    if (acum >= totalInvestimento) {
      const diff = totalInvestimento - prev;
      const frac = projections[i].resultadoFinal > 0 ? diff / projections[i].resultadoFinal : 0;
      paybackMeses = parseFloat((i + frac).toFixed(2));
      break;
    }
  }

  return { totalInvestimento, capitalGiro, roiDireto, roiTotal, paybackMeses, taxaFinal };
}
