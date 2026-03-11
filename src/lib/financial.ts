import type { SimulatorState, MonthlyProjection, InvestmentData } from '@/types/simulator';
import { calcAliquotaEfetiva, sugerirAnexo, getDistribuicaoEfetiva } from '@/lib/simplesNacional';

// ── Lucro Presumido: base de cálculo por tipo de receita ──
function getBasePresumida(tipoReceita: string): { irpj: number; csll: number } {
  switch (tipoReceita) {
    case 'revenda_mercadoria':
    case 'material_didatico':
      return { irpj: 0.08, csll: 0.12 };
    default: // servico, royalties_licenciamento, software_assinatura, outro
      return { irpj: 0.32, csll: 0.32 };
  }
}

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

  // Fixed cost rates
  const mktRate = getRate(fixedCosts, 'marketing');
  const comRate = getRate(fixedCosts, 'comerciais');
  const admRate = getRate(fixedCosts, 'administrativas');

  // Tax config
  const regime = taxes.regime || 'lucro_presumido';
  const buConfigs = taxes.bus || [];
  const simplesConfig = taxes.simples || { rbt12: 0, folha12m: 0, fatorR: 0, anexo: 'III' as const };

  let mrrCaasOwn = 0;
  let mrrSaasOwn = 0;
  let mrrMatriz = 0;
  let mrrPreExistente = state.profile.receitaMensal;
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

    // --- Apply churn ---
    const totalMrrBefore = mrrCaasOwn + mrrSaasOwn + mrrMatriz + mrrPreExistente;
    const churnValor = totalMrrBefore * churnRate;
    if (totalMrrBefore > 0) {
      const factor = 1 - churnRate;
      mrrCaasOwn *= factor;
      mrrSaasOwn *= factor;
      mrrMatriz *= factor;
      mrrPreExistente *= factor;
    }

    // --- Add new MRR ---
    mrrCaasOwn += mix.caas * tCaas;
    mrrSaasOwn += mix.saas * tSaas * revShare;
    mrrMatriz += novoMrrMatriz;

    // --- Pontual revenue ---
    const setupOwn = (mix.caas + mix.saas) * tSetup;
    const recDiag = mix.diagnostico * tDiag;

    // --- DRE Revenue Lines ---
    const rbCaas = mrrCaasOwn + mrrMatriz + mrrPreExistente;
    const rbSaas = mrrSaasOwn + setupOwn + setupMatriz;
    const rbEducation = 0;
    const rbExpansao = recDiag;
    const rbTax = 0;
    const receitaBrutaTotal = rbCaas + rbSaas + rbEducation + rbExpansao + rbTax;

    // Revenue by BU key for tax calculation
    const revenueByBU: Record<string, number> = {
      caas: rbCaas,
      saas: mrrSaasOwn,
      setup: setupOwn + setupMatriz,
    };

    // --- Tax calculation (bifurcated by regime) ---
    let deducaoPIS = 0;
    let deducaoCOFINS = 0;
    let deducaoISSQN = 0;
    let deducaoICMS = 0;
    let deducaoDAS = 0;
    let dasIRPJ = 0;
    let dasCSLL = 0;
    let dasCOFINS = 0;
    let dasPIS = 0;
    let dasCPP = 0;
    let dasISS = 0;
    let irpjCsllCalc = 0;

    if (regime === 'lucro_presumido') {
      // Lucro Presumido: per-BU calculation
      for (const bu of buConfigs) {
        const fat = revenueByBU[bu.buKey] || 0;
        if (fat <= 0) continue;

        deducaoPIS += fat * 0.0065;      // 0.65%
        deducaoCOFINS += fat * 0.03;     // 3%
        deducaoISSQN += fat * (bu.aliquotaIss / 100);

        const base = getBasePresumida(bu.tipoReceita);
        irpjCsllCalc += fat * base.irpj * 0.15; // IRPJ efetivo
        irpjCsllCalc += fat * base.csll * 0.09; // CSLL efetivo
      }
    } else {
      // Simples Nacional: DAS per BU with breakdown
      const sociosAtivosForFR = (state.socios?.socios || []).slice(0, state.socios?.quantidade || 1);
      const proLaboreSocios = sociosAtivosForFR.reduce((s, x) => s + x.proLabore, 0);
      const folha12m = (proLaboreSocios + (state.profile.custoFuncionarios || 0)) * 12;
      const rbt12Efetivo = simplesConfig.rbt12 > 0 ? simplesConfig.rbt12 : receitaBrutaTotal * 12;
      const fatorR = rbt12Efetivo > 0 ? folha12m / rbt12Efetivo : 0;

      for (const bu of buConfigs) {
        const fat = revenueByBU[bu.buKey] || 0;
        if (fat <= 0) continue;

        const anexoEfetivo = bu.sujeitoFatorR ? sugerirAnexo(fatorR) : bu.anexoSimples;
        const aliqEfetiva = calcAliquotaEfetiva(rbt12Efetivo, anexoEfetivo);
        deducaoDAS += fat * (aliqEfetiva / 100);

        // Breakdown by tax component
        const dist = getDistribuicaoEfetiva(rbt12Efetivo, anexoEfetivo);
        dasIRPJ += fat * (dist.irpj / 100);
        dasCSLL += fat * (dist.csll / 100);
        dasCOFINS += fat * (dist.cofins / 100);
        dasPIS += fat * (dist.pis / 100);
        dasCPP += fat * (dist.cpp / 100);
        dasISS += fat * (dist.iss / 100);
      }
      // No separate PIS/COFINS/ISS — all included in DAS
      // No IRPJ/CSLL post-EBITDA
    }

    const deducoesTotal = regime === 'simples_nacional'
      ? deducaoDAS
      : deducaoPIS + deducaoCOFINS + deducaoISSQN + deducaoICMS;

    // Royalties
    const royaltiesValor = receitaBrutaTotal * royaltiesRate;
    const cargaTotalPercent = receitaBrutaTotal > 0 ? ((deducoesTotal + royaltiesValor) / receitaBrutaTotal) * 100 : 0;
    const receitaLiquida = receitaBrutaTotal - deducoesTotal - royaltiesValor;

    // --- Variable costs ---
    const sociosAtivos = (state.socios?.socios || []).slice(0, state.socios?.quantidade || 1);
    const plTecnico = sociosAtivos.filter(s => s.papel === 'tecnico').reduce((s, x) => s + x.proLabore, 0);
    const plComercial = sociosAtivos.filter(s => s.papel === 'comercial').reduce((s, x) => s + x.proLabore, 0);
    const plAdministrativo = sociosAtivos.filter(s => s.papel === 'administrativo').reduce((s, x) => s + x.proLabore, 0);

    const custosCaas = Math.max(rbCaas * custoCaasRate, plTecnico);
    const custosSaas = rbSaas * custoSaasRate;
    const custosEducation = 0;
    const custosCS = 0;
    const custosExpansao = 0;
    const custosTax = 0;
    const custosVariaveisTotal = custosCaas + custosSaas;

    const lucroBruto = receitaLiquida - custosVariaveisTotal;
    const margemBruta = receitaBrutaTotal > 0 ? (lucroBruto / receitaBrutaTotal) * 100 : 0;

    // --- Fixed expenses ---
    const mktBase = receitaBrutaTotal * mktRate;
    const cacAbsorvido = cacTotal > mktBase;
    const despMarketing = Math.max(mktBase, cacTotal);
    const despComerciais = Math.max(receitaBrutaTotal * comRate, plComercial);
    const proLaboreValue = m <= 12 ? (state.goals.proLaboreDesejado || 0) : (state.goals.proLabore12m || 0);
    const despPessoal = state.proLaboreMode === 'distribuicao' ? 0 : proLaboreValue;
    const despAdmBase = receitaBrutaTotal < 100000 ? 6000 : receitaBrutaTotal * admRate;
    const despAdm = Math.max(despAdmBase, plAdministrativo);
    const despFixasTotal = despMarketing + despComerciais + despPessoal + despAdm;

    const ebitda = lucroBruto - despFixasTotal;
    const margemEbitda = receitaBrutaTotal > 0 ? (ebitda / receitaBrutaTotal) * 100 : 0;

    // --- Below EBITDA ---
    let irpjCsll = 0;
    if (regime === 'lucro_presumido' && ebitda > 0) {
      irpjCsll = irpjCsllCalc;
    }
    // Simples: IRPJ/CSLL = 0 (included in DAS)

    const recFinanceiras = receitaBrutaTotal * (belowEbitda.recFinanceirasPercent / 100);
    const despFinanceiras = receitaBrutaTotal * (belowEbitda.despFinanceirasPercent / 100);
    const amortizacaoMes = belowEbitda.amortizacaoPMT;

    const resultadoLiquido = ebitda + recFinanceiras - despFinanceiras - irpjCsll;
    const margemLiquida = receitaBrutaTotal > 0 ? (resultadoLiquido / receitaBrutaTotal) * 100 : 0;
    let resultadoFinal = resultadoLiquido - amortizacaoMes - belowEbitda.investimentosMensal;

    let proLaboreDistribuicao = 0;
    if (state.proLaboreMode === 'distribuicao' && resultadoFinal > 0) {
      proLaboreDistribuicao = proLaboreValue;
      resultadoFinal -= proLaboreDistribuicao;
    }

    const margemFinal = receitaBrutaTotal > 0 ? (resultadoFinal / receitaBrutaTotal) * 100 : 0;

    months.push({
      month: m,
      receitaPreExistente: mrrPreExistente,
      receitaBrutaCaas: rbCaas,
      receitaBrutaSaas: rbSaas,
      receitaBrutaEducation: rbEducation,
      receitaBrutaExpansao: rbExpansao,
      receitaBrutaTax: rbTax,
      receitaBrutaTotal,
      receitaSetupPontual: setupOwn,
      receitaDiagPontual: recDiag,
      receitaSaasOxyGenio: mrrSaasOwn,
      receitaSetupTotal: setupOwn + setupMatriz,
      deducaoPIS, deducaoCOFINS, deducaoISSQN, deducaoICMS, deducaoDAS,
      dasIRPJ, dasCSLL, dasCOFINS, dasPIS, dasCPP, dasISS,
      deducoesTotal,
      royaltiesValor,
      cargaTotalPercent,
      receitaLiquida,
      custosCaas, custosSaas, custosEducation, custosCS, custosExpansao, custosTax,
      cacTotal, cacAbsorvido, custosVariaveisTotal,
      lucroBruto, margemBruta,
      despMarketing, despComerciais, despPessoal, despAdm, despFixasTotal,
      ebitda, margemEbitda,
      recFinanceiras,
      despFinanceiras,
      irpjCsll,
      resultadoLiquido,
      margemLiquida,
      amortizacao: amortizacaoMes,
      investimentos: belowEbitda.investimentosMensal,
      proLaboreDistribuicao,
      resultadoFinal,
      margemFinal,
      mrrCaasOwn, mrrSaasOwn, mrrMatriz,
      mrrTotal: mrrCaasOwn + mrrSaasOwn + mrrMatriz + mrrPreExistente,
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

  let acum = 0;
  let paybackMeses = -1;
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
