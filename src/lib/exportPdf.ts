import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatCurrency, formatPercent } from '@/lib/formatters';

async function loadLogoAsDataUrl(): Promise<string | null> {
  try {
    const res = await fetch('/logo-o2-color.svg');
    const svgText = await res.text();
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 162;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 400, 162);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

const GREEN: [number, number, number] = [30, 120, 60];
const DARK: [number, number, number] = [33, 33, 33];
const SUBTOTAL_BG: [number, number, number] = [230, 245, 235];
const RESULT_BG: [number, number, number] = [200, 235, 210];

type RowStyle = 'header' | 'subtotal' | 'result' | 'detail' | 'percent';

interface DRERow {
  label: string;
  values: (string | number)[];
  style: RowStyle;
}

function sumField(projections: MonthlyProjection[], field: keyof MonthlyProjection): number {
  return projections.reduce((s, p) => s + (p[field] as number), 0);
}

function avgField(projections: MonthlyProjection[], field: keyof MonthlyProjection): number {
  if (projections.length === 0) return 0;
  return sumField(projections, field) / projections.length;
}

function buildDRERows(projections: MonthlyProjection[], state: SimulatorState): DRERow[] {
  const fc = formatCurrency;
  const fp = formatPercent;
  const months = projections.length;

  const row = (label: string, field: keyof MonthlyProjection, style: RowStyle = 'detail', isPercent = false): DRERow => {
    const vals = projections.map(p => isPercent ? fp(p[field] as number) : fc(p[field] as number));
    const total = isPercent ? fp(avgField(projections, field)) : fc(sumField(projections, field));
    return { label, values: [...vals, total], style };
  };

  const rows: DRERow[] = [];

  // RECEITA BRUTA
  rows.push(row('= RECEITA BRUTA', 'receitaBrutaTotal', 'subtotal'));
  rows.push(row('   CAAS', 'receitaBrutaCaas'));
  rows.push(row('   SAAS', 'receitaBrutaSaas'));
  rows.push(row('   Education', 'receitaBrutaEducation'));
  rows.push(row('   Expansão', 'receitaBrutaExpansao'));
  rows.push(row('   Tax', 'receitaBrutaTax'));
  rows.push(row('   Setup (pontual)', 'receitaSetupPontual'));
  rows.push(row('   Diagnóstico (pontual)', 'receitaDiagPontual'));
  rows.push(row('   Receita Pré-existente', 'receitaPreExistente'));

  // DEDUÇÕES
  rows.push({ label: '(-) DEDUÇÕES', values: projections.map(p => fc(p.deducoesTotal)).concat(fc(sumField(projections, 'deducoesTotal'))), style: 'subtotal' });
  rows.push(row('   PIS', 'deducaoPIS'));
  rows.push(row('   COFINS', 'deducaoCOFINS'));
  rows.push(row('   ISSQN', 'deducaoISSQN'));
  rows.push(row('   ICMS', 'deducaoICMS'));

  // ROYALTIES
  rows.push({ label: `(-) Royalties (${state.revenueRules.royalties}%)`, values: projections.map(p => fc(p.royaltiesValor)).concat(fc(sumField(projections, 'royaltiesValor'))), style: 'subtotal' });

  // Carga total
  rows.push(row('   Carga Total %', 'cargaTotalPercent', 'percent', true));

  // RECEITA LÍQUIDA
  rows.push(row('= RECEITA LÍQUIDA', 'receitaLiquida', 'result'));

  // CUSTOS VARIÁVEIS
  const custosVarTotal = (p: MonthlyProjection) => p.custosVariaveisTotal;
  rows.push({ label: '(-) CUSTOS VARIÁVEIS', values: projections.map(p => fc(custosVarTotal(p))).concat(fc(sumField(projections, 'custosVariaveisTotal'))), style: 'subtotal' });
  rows.push(row('   Custos CAAS', 'custosCaas'));
  rows.push(row('   Custos SAAS', 'custosSaas'));
  rows.push(row('   Custos Education', 'custosEducation'));
  rows.push(row('   Custos CS', 'custosCS'));
  rows.push(row('   Custos Expansão', 'custosExpansao'));
  rows.push(row('   Custos Tax', 'custosTax'));
  rows.push(row('   CAC Total', 'cacTotal'));

  // MARGEM DE CONTRIBUIÇÃO
  rows.push(row('= MARGEM DE CONTRIBUIÇÃO', 'lucroBruto', 'result'));
  rows.push(row('   Margem Bruta %', 'margemBruta', 'percent', true));

  // DESPESAS FIXAS
  rows.push({ label: '(-) DESPESAS FIXAS', values: projections.map(p => fc(p.despFixasTotal)).concat(fc(sumField(projections, 'despFixasTotal'))), style: 'subtotal' });
  rows.push(row('   Marketing', 'despMarketing'));
  rows.push(row('   Comerciais', 'despComerciais'));
  rows.push(row('   Pessoal / Pró-labore', 'despPessoal'));
  rows.push(row('   Administrativas', 'despAdm'));

  // RESULTADO OPERACIONAL (EBITDA)
  rows.push(row('= RESULTADO OPERACIONAL', 'ebitda', 'result'));
  rows.push(row('   Margem Operacional %', 'margemEbitda', 'percent', true));

  // Abaixo do EBITDA
  rows.push(row('(-) IRPJ / CSLL', 'irpjCsll', 'detail'));
  rows.push(row('(+) Receitas Financeiras', 'recFinanceiras', 'detail'));
  rows.push(row('(-) Despesas Financeiras', 'despFinanceiras', 'detail'));
  rows.push(row('= RESULTADO LÍQUIDO', 'resultadoLiquido', 'subtotal'));

  rows.push(row('(-) Amortização', 'amortizacao', 'detail'));
  rows.push(row('(-) Investimentos', 'investimentos', 'detail'));

  // RESULTADO FINAL
  rows.push(row('= RESULTADO FINAL', 'resultadoFinal', 'result'));

  return rows;
}

export async function exportPDF(state: SimulatorState, projections: MonthlyProjection[]) {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();

  // ---- HEADER ----
  const logo = await loadLogoAsDataUrl();
  let headerY = 12;
  if (logo) {
    doc.addImage(logo, 'PNG', 14, headerY - 4, 36, 14.6);
  }
  const titleX = logo ? 54 : 14;
  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text('Simulador Financeiro', titleX, headerY + 3);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`${state.profile.nome || 'Sem nome'}  |  Horizonte: ${state.horizonte} meses  |  Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, titleX, headerY + 9);

  // green line
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(14, headerY + 14, pageW - 14, headerY + 14);

  // ---- PREMISSAS ----
  let y = headerY + 20;
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const fc = formatCurrency;
  const premissas = [
    [`Vendas/mês: ${state.commercial.compromissoMensal}`, `Churn mensal: ${state.churn.churnMensal}%`],
    [`Ticket CAAS: ${fc(state.commercial.tickets.find(t => t.key === 'caas')?.valor || 0)}`, `Ticket SAAS: ${fc(state.commercial.tickets.find(t => t.key === 'saas')?.valor || 0)}`],
    [`Royalties: ${state.revenueRules.royalties}%`, `Rev. Share SaaS: ${state.revenueRules.revenueShareSaaS}%`],
    [`Investimento total: ${fc(Object.values(state.investment).reduce((s, v) => s + (typeof v === 'number' ? v : 0), 0))}`, `Pró-labore desejado: ${fc(state.goals.proLaboreDesejado)}`],
  ];
  premissas.forEach(([left, right]) => {
    doc.text(left, 14, y);
    doc.text(right, 140, y);
    y += 4.5;
  });
  y += 2;

  // ---- DRE TABLE ----
  const dreRows = buildDRERows(projections, state);
  const monthHeaders = projections.map(p => `Mês ${p.month}`);
  const headers = ['', ...monthHeaders, 'Total'];

  const body = dreRows.map(r => [r.label, ...r.values]);

  autoTable(doc, {
    startY: y,
    head: [headers],
    body,
    styles: { fontSize: 5.5, cellPadding: 1.2, textColor: DARK },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontSize: 6, fontStyle: 'bold', halign: 'center' },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'normal', halign: 'left' },
    },
    didParseCell: (data: any) => {
      if (data.section !== 'body') return;
      const rowIdx = data.row.index;
      const dreRow = dreRows[rowIdx];
      if (!dreRow) return;

      // Style subtotal rows
      if (dreRow.style === 'subtotal') {
        data.cell.styles.fillColor = SUBTOTAL_BG;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 5.8;
      }
      // Style result rows
      if (dreRow.style === 'result') {
        data.cell.styles.fillColor = RESULT_BG;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 6;
      }
      // Percent rows italic
      if (dreRow.style === 'percent') {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [80, 80, 80];
      }
      // Highlight Total column
      if (data.column.index === headers.length - 1 && data.column.index > 0) {
        const bg = data.cell.styles.fillColor || [255, 255, 255];
        data.cell.styles.fillColor = [Math.max(bg[0] - 10, 200), Math.max(bg[1] - 5, 220), Math.max(bg[2] - 10, 200)];
      }
      // Red for negative values
      if (data.column.index > 0) {
        const raw = String(data.cell.raw);
        if (raw.includes('-') && !raw.startsWith('(') && !raw.startsWith(' ')) {
          data.cell.styles.textColor = [180, 30, 30];
        }
      }
      // Align values center
      if (data.column.index > 0) {
        data.cell.styles.halign = 'right';
      }
    },
    margin: { left: 14, right: 14 },
    tableWidth: 'auto',
  });

  // ---- FOOTER (page 1) ----
  const addFooter = (d: any) => {
    const pageCount = d.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      d.setPage(i);
      d.setFontSize(7);
      d.setTextColor(140, 140, 140);
      d.text(`Gerado por O2 Inc. Simulador Financeiro  •  ${new Date().toLocaleString('pt-BR')}`, 14, d.internal.pageSize.getHeight() - 8);
      d.text(`Página ${i} de ${pageCount}`, pageW - 35, d.internal.pageSize.getHeight() - 8);
    }
  };

  // ---- PAGE 2: MRR & Clientes ----
  doc.addPage('landscape');
  let y2 = 18;
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text('MRR e Evolução de Clientes', 14, y2);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(14, y2 + 3, pageW - 14, y2 + 3);
  y2 += 10;

  const mrrHeaders = ['Mês', 'MRR CAAS', 'MRR SAAS', 'MRR Matriz', 'MRR Total', 'Churn R$', 'Clientes Mês', 'Clientes Acum.', 'Setup Matriz'];
  const mrrBody = projections.map(p => [
    `Mês ${p.month}`,
    formatCurrency(p.mrrCaasOwn),
    formatCurrency(p.mrrSaasOwn),
    formatCurrency(p.mrrMatriz),
    formatCurrency(p.mrrTotal),
    formatCurrency(p.churnValor),
    p.clientesCompradosMes,
    p.clientesCompradosAcum,
    formatCurrency(p.setupMatriz),
  ]);

  autoTable(doc, {
    startY: y2,
    head: [mrrHeaders],
    body: mrrBody,
    styles: { fontSize: 7, cellPadding: 1.5, textColor: DARK },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save('simulacao-o2.pdf');
}
