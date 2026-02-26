export interface ProfileData {
  nome: string;
  experiencia: string;
  possuiConsultoria: boolean;
  clientesAtivos: number;
  ticketMedio: number;
  receitaMensal: number;
  possuiFuncionarios: boolean;
  quantosFuncionarios: number;
  custoFuncionarios: number;
  proLaboreAtual: number;
}

export interface GoalsData {
  faturamento12m: number;
  proLaboreDesejado: number;
  proLabore12m: number;
  metaROIMeses: number;
}

export interface ProductTicket {
  nome: string;
  key: string;
  sugerido: number;
  minimo: number;
  valor: number;
}

export interface SalesMix {
  caas: number;
  saas: number;
  diagnostico: number;
}

export interface CommercialData {
  compromissoMensal: number;
  tickets: ProductTicket[];
  mix: SalesMix;
}

export type GrowthType = 'fixed' | 'incremental' | 'percentage';

export interface MatrixClientsData {
  qtdMensalInicial: number;
  tipoCresc: GrowthType;
  incremClientes: number;
  percCresc: number;
  cacPorCliente: number;
  setupPorCliente: number;
  mrrPorCliente: number;
}

export interface ChurnData {
  churnMensal: number;
}

export interface TaxConfig {
  nome: string;
  key: string;
  aliquota: number;
  aplicaA: { caas: number; saas: number; setup: number; education: number; expansao: number; tax: number };
}

export interface TaxesData {
  impostos: TaxConfig[];
}

export interface RevenueRulesData {
  revenueShareSaaS: number;
  royalties: number;
  mapeamento: {
    setup: string;
    diagnostico: string;
    caas: string;
    saas: string;
  };
}

export interface CostLine {
  nome: string;
  key: string;
  percentual: number;
}

export interface InvestmentData {
  taxaFranquia: number;
  capitalGiro: number;
  implantacao: number;
  marketingInicial: number;
  equipamentos: number;
  outros: number;
  cupom: string;
  cupomAplicado: boolean;
}

export interface MonthlyProjection {
  month: number;
  // Revenue
  receitaPreExistente: number;
  receitaBrutaCaas: number;
  receitaBrutaSaas: number;
  receitaBrutaEducation: number;
  receitaBrutaExpansao: number;
  receitaBrutaTax: number;
  receitaBrutaTotal: number;
  receitaSetupPontual: number;
  receitaDiagPontual: number;
  // Deductions (per tax, excluding IRPJ/CSLL) + Royalties
  deducaoPIS: number;
  deducaoCOFINS: number;
  deducaoISSQN: number;
  deducaoICMS: number;
  deducoesTotal: number;
  royaltiesValor: number;
  cargaTotalPercent: number;
  receitaLiquida: number;
  // Variable costs
  custosCaas: number;
  custosSaas: number;
  custosEducation: number;
  custosCS: number;
  custosExpansao: number;
  custosTax: number;
  cacTotal: number;
  cacAbsorvido: boolean;
  custosVariaveisTotal: number;
  lucroBruto: number;
  margemBruta: number;
  // Fixed expenses
  despMarketing: number;
  despComerciais: number;
  despPessoal: number;
  despAdm: number;
  despFixasTotal: number;
  ebitda: number;
  margemEbitda: number;
  // Below EBITDA
  recFinanceiras: number;
  despFinanceiras: number;
  irpjCsll: number;
  resultadoLiquido: number;
  // Final
  amortizacao: number;
  investimentos: number;
  resultadoFinal: number;
  // MRR tracking
  mrrCaasOwn: number;
  mrrSaasOwn: number;
  mrrMatriz: number;
  mrrTotal: number;
  churnValor: number;
  // Matrix
  clientesCompradosMes: number;
  clientesCompradosAcum: number;
  setupMatriz: number;
}

export interface SimulatorState {
  profile: ProfileData;
  goals: GoalsData;
  horizonte: number;
  proLaboreMode: 'custo_fixo' | 'distribuicao';
  commercial: CommercialData;
  matrixClients: MatrixClientsData;
  churn: ChurnData;
  taxes: TaxesData;
  revenueRules: RevenueRulesData;
  fixedCosts: CostLine[];
  variableCostRates: CostLine[];
  investment: InvestmentData;
  belowEbitda: {
    recFinanceirasPercent: number;
    despFinanceirasPercent: number;
    amortizacaoPMT: number;
    investimentosMensal: number;
  };
}

export const DEFAULT_TICKETS: ProductTicket[] = [
  { nome: 'Setup', key: 'setup', sugerido: 15000, minimo: 8000, valor: 15000 },
  { nome: 'CFO as a Service (CAAS)', key: 'caas', sugerido: 9500, minimo: 6500, valor: 9500 },
  { nome: 'SAAS', key: 'saas', sugerido: 2500, minimo: 730, valor: 2500 },
  { nome: 'Diagnóstico Estratégico', key: 'diagnostico', sugerido: 18000, minimo: 12000, valor: 18000 },
];

export const DEFAULT_TAXES: TaxConfig[] = [
  { nome: 'PIS', key: 'pis', aliquota: 0, aplicaA: { caas: 0.65, saas: 0.65, setup: 0.65, education: 0.65, expansao: 0.65, tax: 0.65 } },
  { nome: 'COFINS', key: 'cofins', aliquota: 0, aplicaA: { caas: 3.00, saas: 3.00, setup: 3.00, education: 3.00, expansao: 3.00, tax: 3.00 } },
  { nome: 'IRPJ', key: 'irpj', aliquota: 0, aplicaA: { caas: 5.70, saas: 5.70, setup: 2.10, education: 5.70, expansao: 5.70, tax: 5.70 } },
  { nome: 'CSLL', key: 'csll', aliquota: 0, aplicaA: { caas: 2.88, saas: 2.88, setup: 1.08, education: 2.88, expansao: 2.88, tax: 2.88 } },
  { nome: 'ISSQN', key: 'issqn', aliquota: 0, aplicaA: { caas: 2.90, saas: 2.90, setup: 0, education: 2.00, expansao: 5.00, tax: 2.00 } },
  { nome: 'ICMS', key: 'icms', aliquota: 0, aplicaA: { caas: 0, saas: 0, setup: 0, education: 0, expansao: 0, tax: 0 } },
];

export const INITIAL_STATE: SimulatorState = {
  profile: {
    nome: '',
    experiencia: '',
    possuiConsultoria: false,
    clientesAtivos: 0,
    ticketMedio: 0,
    receitaMensal: 0,
    possuiFuncionarios: false,
    quantosFuncionarios: 0,
    custoFuncionarios: 0,
    proLaboreAtual: 0,
  },
  goals: {
    faturamento12m: 0,
    proLaboreDesejado: 0,
    proLabore12m: 0,
    metaROIMeses: 24,
  },
  horizonte: 12,
  proLaboreMode: 'custo_fixo',
  commercial: {
    compromissoMensal: 3,
    tickets: DEFAULT_TICKETS.map(t => ({ ...t })),
    mix: { caas: 1, saas: 1, diagnostico: 1 },
  },
  matrixClients: {
    qtdMensalInicial: 0,
    tipoCresc: 'fixed',
    incremClientes: 0,
    percCresc: 0,
    cacPorCliente: 9000,
    setupPorCliente: 15000,
    mrrPorCliente: 6570.10,
  },
  churn: { churnMensal: 2 },
  taxes: { impostos: DEFAULT_TAXES.map(t => ({ ...t, aplicaA: { ...t.aplicaA } })) },
  revenueRules: {
    revenueShareSaaS: 30,
    royalties: 20,
    mapeamento: { setup: 'saas', diagnostico: 'caas', caas: 'caas', saas: 'saas' },
  },
  fixedCosts: [
    { nome: 'Despesas de Marketing', key: 'marketing', percentual: 7.5 },
    { nome: 'Despesas Comerciais', key: 'comerciais', percentual: 7.5 },
    { nome: 'Despesas Administrativas', key: 'administrativas', percentual: 6 },
  ],
  variableCostRates: [
    { nome: 'Custos CAAS', key: 'caas', percentual: 25 },
    { nome: 'Custos SAAS', key: 'saas', percentual: 0 },
    { nome: 'Custos Education', key: 'education', percentual: 0 },
    { nome: 'Custos Customer Success', key: 'cs', percentual: 0 },
    { nome: 'Custos Expansão', key: 'expansao', percentual: 0 },
    { nome: 'Custos Tax', key: 'tax', percentual: 0 },
  ],
  investment: {
    taxaFranquia: 190000,
    capitalGiro: 0,
    implantacao: 0,
    marketingInicial: 0,
    equipamentos: 0,
    outros: 0,
    cupom: '',
    cupomAplicado: false,
  },
  belowEbitda: {
    recFinanceirasPercent: 0,
    despFinanceirasPercent: 1,
    amortizacaoPMT: 0,
    investimentosMensal: 0,
  },
};
