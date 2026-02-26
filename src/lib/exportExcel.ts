import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { calculateROI } from '@/lib/financial';
import ExcelJS from 'exceljs';

// ── O2 Color Palette ──
const COLORS = {
  darkGreen: 'FF2D5A1B',
  mediumGreen: 'FF4CAF50',
  lightGreen: 'FFE8F5E0',
  white: 'FFFFFFFF',
  darkText: 'FF333333',
  red: 'FFD32F2F',
  lightGray: 'FFF5F5F5',
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
};

function applyHeaderStyle(row: ExcelJS.Row, colCount: number) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > colCount) return;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkGreen } };
    cell.font = { bold: true, color: { argb: COLORS.white }, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = THIN_BORDER;
  });
}

function applySubtotalStyle(row: ExcelJS.Row, colCount: number) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > colCount) return;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightGreen } };
    cell.font = { bold: true, color: { argb: COLORS.darkText }, size: 10 };
    cell.border = THIN_BORDER;
  });
}

function applyResultStyle(row: ExcelJS.Row, colCount: number) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > colCount) return;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.mediumGreen } };
    cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
    cell.border = THIN_BORDER;
  });
}

function applyDetailStyle(row: ExcelJS.Row, colCount: number) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber > colCount) return;
    cell.font = { color: { argb: COLORS.darkText }, size: 10 };
    cell.border = THIN_BORDER;
  });
}

function applyNegativeRedFont(row: ExcelJS.Row, colCount: number) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= 1 || colNumber > colCount) return;
    if (typeof cell.value === 'number' && cell.value < 0) {
      cell.font = { ...cell.font, color: { argb: COLORS.red } };
    }
  });
}

function setMoneyFormat(row: ExcelJS.Row, colCount: number, startCol = 2) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber < startCol || colNumber > colCount) return;
    if (typeof cell.value === 'number') {
      cell.numFmt = '#,##0.00';
    }
  });
}

function setPercentFormat(row: ExcelJS.Row, colCount: number, startCol = 2) {
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber < startCol || colNumber > colCount) return;
    if (typeof cell.value === 'number') {
      cell.numFmt = '0.00%';
      cell.value = cell.value / 100;
    }
  });
}

// ═══════════════════════════════════════════════
// Sheet 1: DRE Gerencial
// ═══════════════════════════════════════════════

type RowType = 'detail' | 'subtotal' | 'result' | 'percent';

interface DRERow {
  label: string;
  field: keyof MonthlyProjection;
  type: RowType;
  isPercent?: boolean;
}

const DRE_ROWS: DRERow[] = [
  { label: '= RECEITA BRUTA', field: 'receitaBrutaTotal', type: 'subtotal' },
  { label: '   CAAS', field: 'receitaBrutaCaas', type: 'detail' },
  { label: '   SAAS', field: 'receitaBrutaSaas', type: 'detail' },
  { label: '   Education', field: 'receitaBrutaEducation', type: 'detail' },
  { label: '   Expansão', field: 'receitaBrutaExpansao', type: 'detail' },
  { label: '   Tax', field: 'receitaBrutaTax', type: 'detail' },
  { label: '   Setup (pontual)', field: 'receitaSetupPontual', type: 'detail' },
  { label: '   Diagnóstico (pontual)', field: 'receitaDiagPontual', type: 'detail' },
  { label: '   Receita Pré-existente', field: 'receitaPreExistente', type: 'detail' },
  { label: '(-) DEDUÇÕES', field: 'deducoesTotal', type: 'subtotal' },
  { label: '   PIS', field: 'deducaoPIS', type: 'detail' },
  { label: '   COFINS', field: 'deducaoCOFINS', type: 'detail' },
  { label: '   ISSQN', field: 'deducaoISSQN', type: 'detail' },
  { label: '   ICMS', field: 'deducaoICMS', type: 'detail' },
  { label: '(-) Royalties', field: 'royaltiesValor', type: 'subtotal' },
  { label: '   Carga Total %', field: 'cargaTotalPercent', type: 'percent', isPercent: true },
  { label: '= RECEITA LÍQUIDA', field: 'receitaLiquida', type: 'result' },
  { label: '(-) CUSTOS VARIÁVEIS', field: 'custosVariaveisTotal', type: 'subtotal' },
  { label: '   Custos CAAS', field: 'custosCaas', type: 'detail' },
  { label: '   Custos SAAS', field: 'custosSaas', type: 'detail' },
  { label: '   Custos Education', field: 'custosEducation', type: 'detail' },
  { label: '   Custos CS', field: 'custosCS', type: 'detail' },
  { label: '   Custos Expansão', field: 'custosExpansao', type: 'detail' },
  { label: '   Custos Tax', field: 'custosTax', type: 'detail' },
  { label: '= MARGEM DE CONTRIBUIÇÃO', field: 'lucroBruto', type: 'result' },
  { label: '   Margem Bruta %', field: 'margemBruta', type: 'percent', isPercent: true },
  { label: '(-) DESPESAS FIXAS', field: 'despFixasTotal', type: 'subtotal' },
  { label: '   Marketing', field: 'despMarketing', type: 'detail' },
  { label: '   Comerciais', field: 'despComerciais', type: 'detail' },
  { label: '   Pessoal / Pró-labore', field: 'despPessoal', type: 'detail' },
  { label: '   Administrativas', field: 'despAdm', type: 'detail' },
  { label: '= RESULTADO OPERACIONAL', field: 'ebitda', type: 'result' },
  { label: '   Margem Operacional %', field: 'margemEbitda', type: 'percent', isPercent: true },
  { label: '(-) IRPJ / CSLL', field: 'irpjCsll', type: 'detail' },
  { label: '(+) Receitas Financeiras', field: 'recFinanceiras', type: 'detail' },
  { label: '(-) Despesas Financeiras', field: 'despFinanceiras', type: 'detail' },
  { label: '= RESULTADO LÍQUIDO', field: 'resultadoLiquido', type: 'subtotal' },
  { label: '(-) Amortização', field: 'amortizacao', type: 'detail' },
  { label: '(-) Investimentos', field: 'investimentos', type: 'detail' },
  { label: '= RESULTADO FINAL', field: 'resultadoFinal', type: 'result' },
];

function buildDRESheet(wb: ExcelJS.Workbook, projections: MonthlyProjection[], state: SimulatorState) {
  const ws = wb.addWorksheet('DRE Gerencial');
  const months = projections.length;
  const colCount = months + 2; // label + months + total

  // Title row (merged)
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = 'O2 INC — DRE Gerencial';
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkGreen } };
  titleCell.font = { bold: true, color: { argb: COLORS.white }, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // Header row
  const headerData = ['DRE Gerencial', ...projections.map(p => `Mês ${p.month}`), 'Total'];
  const headerRow = ws.addRow(headerData);
  applyHeaderStyle(headerRow, colCount);

  const sum = (field: keyof MonthlyProjection) => projections.reduce((s, p) => s + (p[field] as number), 0);
  const avg = (field: keyof MonthlyProjection) => sum(field) / months;

  // Data rows
  for (const dreLine of DRE_ROWS) {
    const vals = projections.map(p => p[dreLine.field] as number);
    const total = dreLine.isPercent ? avg(dreLine.field) : sum(dreLine.field);
    const row = ws.addRow([dreLine.label, ...vals, total]);

    switch (dreLine.type) {
      case 'subtotal': applySubtotalStyle(row, colCount); break;
      case 'result': applyResultStyle(row, colCount); break;
      default: applyDetailStyle(row, colCount); break;
    }

    if (dreLine.isPercent) {
      setPercentFormat(row, colCount);
    } else {
      setMoneyFormat(row, colCount);
      applyNegativeRedFont(row, colCount);
    }
  }

  // Column widths
  ws.getColumn(1).width = 32;
  for (let c = 2; c <= colCount; c++) {
    ws.getColumn(c).width = 16;
  }

  // Freeze panes: freeze first column + header rows
  ws.views = [{ state: 'frozen' as const, xSplit: 1, ySplit: 2 }];
}

// ═══════════════════════════════════════════════
// Sheet 2: MRR e Clientes
// ═══════════════════════════════════════════════

interface MRRRow {
  label: string;
  getValues: (projections: MonthlyProjection[]) => number[];
  type: RowType;
}

const MRR_ROWS: MRRRow[] = [
  { label: 'MRR CAAS', getValues: ps => ps.map(p => p.mrrCaasOwn), type: 'detail' },
  { label: 'MRR SAAS', getValues: ps => ps.map(p => p.mrrSaasOwn), type: 'detail' },
  { label: 'MRR Matriz', getValues: ps => ps.map(p => p.mrrMatriz), type: 'detail' },
  { label: 'MRR Total', getValues: ps => ps.map(p => p.mrrTotal), type: 'subtotal' },
  { label: 'Churn R$', getValues: ps => ps.map(p => p.churnValor), type: 'detail' },
  { label: 'Clientes no Mês', getValues: ps => ps.map(p => p.clientesCompradosMes), type: 'detail' },
  { label: 'Clientes Acumulados', getValues: ps => ps.map(p => p.clientesCompradosAcum), type: 'subtotal' },
  { label: 'Setup Matriz', getValues: ps => ps.map(p => p.setupMatriz), type: 'detail' },
];

function buildMRRSheet(wb: ExcelJS.Workbook, projections: MonthlyProjection[]) {
  const ws = wb.addWorksheet('MRR e Clientes');
  const colCount = projections.length + 1;

  // Title row
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = 'O2 INC — MRR e Clientes';
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkGreen } };
  titleCell.font = { bold: true, color: { argb: COLORS.white }, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 30;

  // Header
  const headerRow = ws.addRow(['MRR e Clientes', ...projections.map(p => `Mês ${p.month}`)]);
  applyHeaderStyle(headerRow, colCount);

  for (const mrrLine of MRR_ROWS) {
    const vals = mrrLine.getValues(projections);
    const row = ws.addRow([mrrLine.label, ...vals]);

    switch (mrrLine.type) {
      case 'subtotal': applySubtotalStyle(row, colCount); break;
      default: applyDetailStyle(row, colCount); break;
    }

    setMoneyFormat(row, colCount);
    applyNegativeRedFont(row, colCount);
  }

  ws.getColumn(1).width = 24;
  for (let c = 2; c <= colCount; c++) ws.getColumn(c).width = 16;

  ws.views = [{ state: 'frozen' as const, xSplit: 1, ySplit: 2 }];
}

// ═══════════════════════════════════════════════
// Sheet 3: ROI e Investimento
// ═══════════════════════════════════════════════

function buildROISheet(wb: ExcelJS.Workbook, state: SimulatorState, projections: MonthlyProjection[]) {
  const ws = wb.addWorksheet('ROI e Investimento');
  const roi = calculateROI(state.investment, projections);
  const inv = state.investment;

  const addSectionTitle = (title: string) => {
    const currentRow = ws.lastRow ? ws.lastRow.number + 1 : 1;
    ws.mergeCells(currentRow, 1, currentRow, 3);
    const cell = ws.getCell(currentRow, 1);
    cell.value = title;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.darkGreen } };
    cell.font = { bold: true, color: { argb: COLORS.white }, size: 12 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = THIN_BORDER;
    ws.getRow(currentRow).height = 26;
  };

  const addSubHeader = () => {
    const row = ws.addRow(['Item', 'Valor', '']);
    applyHeaderStyle(row, 2);
  };

  const addDataRow = (label: string, value: number | string, highlight = false) => {
    const row = ws.addRow([label, value, '']);
    if (highlight) {
      applySubtotalStyle(row, 2);
    } else {
      applyDetailStyle(row, 2);
    }
    if (typeof value === 'number') {
      setMoneyFormat(row, 2);
    }
  };

  // INVESTIMENTO DETALHADO
  addSectionTitle('INVESTIMENTO DETALHADO');
  addSubHeader();
  addDataRow('Taxa de Franquia', roi.taxaFinal);
  addDataRow('Implantação', inv.implantacao);
  addDataRow('Marketing Inicial', inv.marketingInicial);
  addDataRow('Equipamentos', inv.equipamentos);
  addDataRow('Outros', inv.outros);
  addDataRow('Capital de Giro (sugerido)', roi.capitalGiro);
  addDataRow('INVESTIMENTO TOTAL', roi.totalInvestimento, true);

  ws.addRow([]);

  // INDICADORES DE RETORNO
  addSectionTitle('INDICADORES DE RETORNO');
  addSubHeader();
  addDataRow('ROI Direto', `${roi.roiDireto.toFixed(1)}%`);
  addDataRow('ROI Total', `${roi.roiTotal.toFixed(1)}%`);
  addDataRow('Payback', roi.paybackMeses >= 0 ? `${roi.paybackMeses} meses` : 'Não atingido');

  ws.addRow([]);

  // PREMISSAS PRINCIPAIS
  addSectionTitle('PREMISSAS PRINCIPAIS');
  const premHeader = ws.addRow(['Premissa', 'Valor', '']);
  applyHeaderStyle(premHeader, 2);
  addDataRow('Vendas / mês', state.commercial.compromissoMensal);
  addDataRow('Ticket CAAS', state.commercial.tickets.find(t => t.key === 'caas')?.valor || 0);
  addDataRow('Ticket SAAS', state.commercial.tickets.find(t => t.key === 'saas')?.valor || 0);
  addDataRow('Churn mensal', `${state.churn.churnMensal}%`);
  addDataRow('Royalties', `${state.revenueRules.royalties}%`);
  addDataRow('Rev. Share SaaS', `${state.revenueRules.revenueShareSaaS}%`);
  addDataRow('Horizonte', `${state.horizonte} meses`);
  addDataRow('Pró-labore desejado', state.goals.proLaboreDesejado);

  ws.getColumn(1).width = 32;
  ws.getColumn(2).width = 22;
  ws.getColumn(3).width = 5;
}

// ═══════════════════════════════════════════════
// Main export function
// ═══════════════════════════════════════════════

export async function exportExcel(state: SimulatorState, projections: MonthlyProjection[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'O2 Inc.';
  wb.created = new Date();

  buildDRESheet(wb, projections, state);
  buildMRRSheet(wb, projections);
  buildROISheet(wb, state, projections);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'simulacao-o2.xlsx';
  a.click();
  URL.revokeObjectURL(url);
}
