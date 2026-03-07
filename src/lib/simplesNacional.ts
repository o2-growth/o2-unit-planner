// Tabelas do Simples Nacional — Anexos III, IV e V
// Faixas de faturamento acumulado 12 meses (RBT12)

interface FaixaSN {
  limite: number; // limite superior da faixa
  aliqNominal: number; // % nominal
  parcelaDeduzir: number; // R$
}

const ANEXO_III: FaixaSN[] = [
  { limite: 180000, aliqNominal: 6.00, parcelaDeduzir: 0 },
  { limite: 360000, aliqNominal: 11.20, parcelaDeduzir: 9360 },
  { limite: 720000, aliqNominal: 13.50, parcelaDeduzir: 17640 },
  { limite: 1800000, aliqNominal: 16.00, parcelaDeduzir: 35640 },
  { limite: 3600000, aliqNominal: 21.00, parcelaDeduzir: 125640 },
  { limite: 4800000, aliqNominal: 33.00, parcelaDeduzir: 648000 },
];

const ANEXO_IV: FaixaSN[] = [
  { limite: 180000, aliqNominal: 4.50, parcelaDeduzir: 0 },
  { limite: 360000, aliqNominal: 9.00, parcelaDeduzir: 8100 },
  { limite: 720000, aliqNominal: 10.20, parcelaDeduzir: 12420 },
  { limite: 1800000, aliqNominal: 14.00, parcelaDeduzir: 39780 },
  { limite: 3600000, aliqNominal: 20.00, parcelaDeduzir: 147780 },
  { limite: 4800000, aliqNominal: 30.00, parcelaDeduzir: 507780 },
];

const ANEXO_V: FaixaSN[] = [
  { limite: 180000, aliqNominal: 15.50, parcelaDeduzir: 0 },
  { limite: 360000, aliqNominal: 18.00, parcelaDeduzir: 4500 },
  { limite: 720000, aliqNominal: 19.50, parcelaDeduzir: 9900 },
  { limite: 1800000, aliqNominal: 20.50, parcelaDeduzir: 17100 },
  { limite: 3600000, aliqNominal: 23.00, parcelaDeduzir: 62100 },
  { limite: 4800000, aliqNominal: 30.50, parcelaDeduzir: 540000 },
];

const TABELAS: Record<string, FaixaSN[]> = {
  III: ANEXO_III,
  IV: ANEXO_IV,
  V: ANEXO_V,
};

function getFaixa(rbt12: number, anexo: string): FaixaSN | null {
  const tabela = TABELAS[anexo];
  if (!tabela || rbt12 <= 0) return null;
  for (const faixa of tabela) {
    if (rbt12 <= faixa.limite) return faixa;
  }
  return null; // excede o limite do Simples
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
