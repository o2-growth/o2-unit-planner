// Tabelas do Simples Nacional — Anexos III, IV e V
// Faixas de faturamento acumulado 12 meses (RBT12)

interface FaixaSN {
  limite: number; // limite superior da faixa
  aliqNominal: number; // % nominal
  parcelaDeduzir: number; // R$
}

// Distribuição percentual dos tributos dentro de cada faixa (% do valor do DAS)
export interface DistribuicaoDAS {
  irpj: number;
  csll: number;
  cofins: number;
  pis: number;
  cpp: number;
  iss: number;
}

interface FaixaCompleta {
  limite: number;
  aliqNominal: number;
  parcelaDeduzir: number;
  distribuicao: DistribuicaoDAS;
}

const ANEXO_III_COMPLETO: FaixaCompleta[] = [
  { limite: 180000, aliqNominal: 6.00, parcelaDeduzir: 0, distribuicao: { irpj: 4.00, csll: 3.50, cofins: 12.82, pis: 2.78, cpp: 43.40, iss: 33.50 } },
  { limite: 360000, aliqNominal: 11.20, parcelaDeduzir: 9360, distribuicao: { irpj: 4.00, csll: 3.50, cofins: 14.05, pis: 3.05, cpp: 43.40, iss: 32.00 } },
  { limite: 720000, aliqNominal: 13.50, parcelaDeduzir: 17640, distribuicao: { irpj: 4.00, csll: 3.50, cofins: 13.64, pis: 2.96, cpp: 43.40, iss: 32.50 } },
  { limite: 1800000, aliqNominal: 16.00, parcelaDeduzir: 35640, distribuicao: { irpj: 4.00, csll: 3.50, cofins: 13.64, pis: 2.96, cpp: 43.40, iss: 32.50 } },
  { limite: 3600000, aliqNominal: 21.00, parcelaDeduzir: 125640, distribuicao: { irpj: 4.00, csll: 3.50, cofins: 12.82, pis: 2.78, cpp: 43.40, iss: 33.50 } },
  { limite: 4800000, aliqNominal: 33.00, parcelaDeduzir: 648000, distribuicao: { irpj: 35.00, csll: 15.00, cofins: 16.03, pis: 3.47, cpp: 30.50, iss: 0 } },
];

const ANEXO_IV_COMPLETO: FaixaCompleta[] = [
  { limite: 180000, aliqNominal: 4.50, parcelaDeduzir: 0, distribuicao: { irpj: 18.80, csll: 15.20, cofins: 17.67, pis: 3.83, cpp: 0, iss: 44.50 } },
  { limite: 360000, aliqNominal: 9.00, parcelaDeduzir: 8100, distribuicao: { irpj: 19.80, csll: 15.20, cofins: 20.55, pis: 4.45, cpp: 0, iss: 40.00 } },
  { limite: 720000, aliqNominal: 10.20, parcelaDeduzir: 12420, distribuicao: { irpj: 20.80, csll: 15.20, cofins: 19.73, pis: 4.27, cpp: 0, iss: 40.00 } },
  { limite: 1800000, aliqNominal: 14.00, parcelaDeduzir: 39780, distribuicao: { irpj: 17.80, csll: 19.20, cofins: 18.90, pis: 4.10, cpp: 0, iss: 40.00 } },
  { limite: 3600000, aliqNominal: 20.00, parcelaDeduzir: 147780, distribuicao: { irpj: 18.80, csll: 19.20, cofins: 18.08, pis: 3.92, cpp: 0, iss: 40.00 } },
  { limite: 4800000, aliqNominal: 30.00, parcelaDeduzir: 507780, distribuicao: { irpj: 53.50, csll: 21.50, cofins: 20.55, pis: 4.45, cpp: 0, iss: 0 } },
];

const ANEXO_V_COMPLETO: FaixaCompleta[] = [
  { limite: 180000, aliqNominal: 15.50, parcelaDeduzir: 0, distribuicao: { irpj: 14.00, csll: 15.00, cofins: 21.90, pis: 6.25, cpp: 28.85, iss: 14.00 } },
  { limite: 360000, aliqNominal: 18.00, parcelaDeduzir: 4500, distribuicao: { irpj: 14.00, csll: 15.00, cofins: 20.40, pis: 5.75, cpp: 27.85, iss: 17.00 } },
  { limite: 720000, aliqNominal: 19.50, parcelaDeduzir: 9900, distribuicao: { irpj: 14.00, csll: 15.00, cofins: 21.40, pis: 6.25, cpp: 23.85, iss: 19.50 } },
  { limite: 1800000, aliqNominal: 20.50, parcelaDeduzir: 17100, distribuicao: { irpj: 14.00, csll: 12.50, cofins: 22.90, pis: 6.25, cpp: 23.85, iss: 20.50 } },
  { limite: 3600000, aliqNominal: 23.00, parcelaDeduzir: 62100, distribuicao: { irpj: 14.00, csll: 12.50, cofins: 20.40, pis: 5.75, cpp: 23.85, iss: 23.50 } },
  { limite: 4800000, aliqNominal: 30.50, parcelaDeduzir: 540000, distribuicao: { irpj: 35.00, csll: 15.50, cofins: 16.50, pis: 3.50, cpp: 29.50, iss: 0 } },
];

// Legacy simple arrays for backward compat
const ANEXO_III: FaixaSN[] = ANEXO_III_COMPLETO;
const ANEXO_IV: FaixaSN[] = ANEXO_IV_COMPLETO;
const ANEXO_V: FaixaSN[] = ANEXO_V_COMPLETO;

const TABELAS: Record<string, FaixaSN[]> = {
  III: ANEXO_III,
  IV: ANEXO_IV,
  V: ANEXO_V,
};

const TABELAS_COMPLETAS: Record<string, FaixaCompleta[]> = {
  III: ANEXO_III_COMPLETO,
  IV: ANEXO_IV_COMPLETO,
  V: ANEXO_V_COMPLETO,
};

function getFaixa(rbt12: number, anexo: string): FaixaSN | null {
  const tabela = TABELAS[anexo];
  if (!tabela || rbt12 <= 0) return null;
  for (const faixa of tabela) {
    if (rbt12 <= faixa.limite) return faixa;
  }
  return null; // excede o limite do Simples
}

function getFaixaCompleta(rbt12: number, anexo: string): FaixaCompleta | null {
  const tabela = TABELAS_COMPLETAS[anexo];
  if (!tabela || rbt12 <= 0) return null;
  for (const faixa of tabela) {
    if (rbt12 <= faixa.limite) return faixa;
  }
  return null;
}

/**
 * Calcula a alíquota efetiva do Simples Nacional.
 * Fórmula: ((RBT12 × AliqNominal% − ParcelaDeduzir) / RBT12) × 100
 */
export function calcAliquotaEfetiva(rbt12: number, anexo: string): number {
  const faixa = getFaixa(rbt12, anexo);
  if (!faixa || rbt12 <= 0) return 0;
  const aliq = ((rbt12 * (faixa.aliqNominal / 100) - faixa.parcelaDeduzir) / rbt12) * 100;
  return Math.max(aliq, 0);
}

/**
 * Retorna a distribuição dos tributos do DAS para um dado RBT12 e anexo.
 * Cada valor retornado é a alíquota efetiva daquele tributo (% sobre faturamento).
 */
export function getDistribuicaoEfetiva(rbt12: number, anexo: string): DistribuicaoDAS {
  const faixa = getFaixaCompleta(rbt12, anexo);
  if (!faixa || rbt12 <= 0) return { irpj: 0, csll: 0, cofins: 0, pis: 0, cpp: 0, iss: 0 };
  const aliqEfetiva = calcAliquotaEfetiva(rbt12, anexo);
  // Cada tributo = alíquota efetiva × (% distribuição / 100)
  return {
    irpj: aliqEfetiva * (faixa.distribuicao.irpj / 100),
    csll: aliqEfetiva * (faixa.distribuicao.csll / 100),
    cofins: aliqEfetiva * (faixa.distribuicao.cofins / 100),
    pis: aliqEfetiva * (faixa.distribuicao.pis / 100),
    cpp: aliqEfetiva * (faixa.distribuicao.cpp / 100),
    iss: aliqEfetiva * (faixa.distribuicao.iss / 100),
  };
}

/**
 * Sugere o anexo com base no Fator R.
 * Fator R ≥ 28% → Anexo III (menor carga), senão Anexo V.
 */
export function sugerirAnexo(fatorR: number): 'III' | 'V' {
  return fatorR >= 0.28 ? 'III' : 'V';
}

/**
 * Retorna o label da faixa (1ª Faixa, 2ª Faixa, etc.)
 */
export function getFaixaLabel(rbt12: number, anexo: string): string {
  const tabela = TABELAS[anexo];
  if (!tabela || rbt12 <= 0) return '—';
  for (let i = 0; i < tabela.length; i++) {
    if (rbt12 <= tabela[i].limite) return `${i + 1}ª Faixa`;
  }
  return 'Excede limite';
}

/**
 * Verifica se o RBT12 excede o limite do Simples Nacional (R$ 4.800.000)
 */
export function excedeSimples(rbt12: number): boolean {
  return rbt12 > 4800000;
}
