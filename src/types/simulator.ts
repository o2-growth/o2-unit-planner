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

// ── Legacy tax types (for migration) ──
export interface LegacyTaxConfig {
  nome: string;
  key: string;
  aliquota: number;
  aplicaA: { caas: number; saas: number; setup: number; education: number; expansao: number; tax: number; demais?: number };
}

// ── New tax types ──
export type RegimeTributario = 'lucro_presumido' | 'simples_nacional';

export type TipoReceita = 'servico' | 'revenda_mercadoria' | 'royalties_licenciamento' | 'material_didatico' | 'software_assinatura' | 'outro';

export type AnexoSimples = 'III' | 'IV' | 'V';

export interface BUTaxConfig {
  buKey: string;
  buNome: string;
  tipoReceita: TipoReceita;
  cnae: string;
  municipioIss: string;
  aliquotaIss: number;
  faturamentoBU: number;
  anexoSimples: AnexoSimples;
  sujeitoFatorR: boolean;
}

export interface SimplesNacionalConfig {
  rbt12: number;
  folha12m: number;
  fatorR: number;
  anexo: 'III' | 'V';
}

export interface TaxesData {
  regime: RegimeTributario;
  faturamentoTotalMes: number;
  bus: BUTaxConfig[];
  simples: SimplesNacionalConfig;
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

export type SocioPapel = 'tecnico' | 'comercial' | 'administrativo';

export interface SocioData {
  proLabore: number;
  papel: SocioPapel;
}

export interface SociosConfig {
  quantidade: 1 | 2 | 3;
  socios: SocioData[];
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
  receitaSaasOxyGenio: number;
  receitaSetupTotal: number;
  // Deductions
  deducaoPIS: number;
  deducaoCOFINS: number;
  deducaoISSQN: number;
  deducaoICMS: number;
  deducaoDAS: number;
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
  margemLiquida: number;
  // Final
  amortizacao: number;
  investimentos: number;
  proLaboreDistribuicao: number;
  resultadoFinal: number;
  margemFinal: number;
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
  socios: SociosConfig;
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

export const DEFAULT_BUS: BUTaxConfig[] = [
  { buKey: 'caas', buNome: 'CaaS', tipoReceita: 'servico', cnae: '7020-4/00', municipioIss: '', aliquotaIss: 2, faturamentoBU: 0, anexoSimples: 'III', sujeitoFatorR: true },
  { buKey: 'saas', buNome: 'SaaS', tipoReceita: 'software_assinatura', cnae: '', municipioIss: '', aliquotaIss: 2, faturamentoBU: 0, anexoSimples: 'III', sujeitoFatorR: false },
  { buKey: 'setup', buNome: 'Setup', tipoReceita: 'software_assinatura', cnae: '', municipioIss: '', aliquotaIss: 0, faturamentoBU: 0, anexoSimples: 'III', sujeitoFatorR: false },
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
  taxes: {
    regime: 'lucro_presumido',
    faturamentoTotalMes: 0,
    bus: DEFAULT_BUS.map(b => ({ ...b })),
    simples: { rbt12: 0, folha12m: 0, fatorR: 0, anexo: 'III' as const },
  },
  revenueRules: {
    revenueShareSaaS: 30,
    royalties: 20,
    mapeamento: { setup: 'saas', diagnostico: 'caas', caas: 'caas', saas: 'saas' },
  },
  fixedCosts: [
    { nome: 'Despesas de Marketing', key: 'marketing', percentual: 5 },
    { nome: 'Despesas Comerciais', key: 'comerciais', percentual: 5 },
    { nome: 'Despesas Administrativas', key: 'administrativas', percentual: 5 },
  ],
  variableCostRates: [
    { nome: 'Custos CAAS', key: 'caas', percentual: 25 },
    { nome: 'Custos SAAS', key: 'saas', percentual: 0 },
  ],
  socios: {
    quantidade: 1,
    socios: [{ proLabore: 0, papel: 'tecnico' as SocioPapel }],
  },
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
