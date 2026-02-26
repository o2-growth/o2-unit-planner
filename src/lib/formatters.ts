export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
}

export function parseCurrencyInput(raw: string): number {
  // Remove everything except digits, dots, commas, minus
  let cleaned = raw.replace(/[^\d,.\-]/g, '');
  // Brazilian format: dots are thousands, comma is decimal
  // Remove thousand separators (dots) then convert decimal comma to dot
  cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

export function formatCurrencyInput(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 10000) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCurrencySigned(value: number): string {
  if (value < 0) {
    return '-' + formatCurrency(Math.abs(value));
  }
  return formatCurrency(value);
}
