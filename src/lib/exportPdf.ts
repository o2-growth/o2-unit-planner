import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatPercent, formatCurrencyCompact } from '@/lib/formatters';
import { calculateROI, calculateCapitalGiro } from '@/lib/financial';

// ─── Colors ───
const GREEN: [number, number, number] = [110, 222, 64];
const GREEN_DARK: [number, number, number] = [30, 120, 60];
const DARK: [number, number, number] = [33, 33, 33];
const DARK_BG: [number, number, number] = [20, 25, 30];
const WHITE: [number, number, number] = [255, 255, 255];
const SUBTOTAL_BG: [number, number, number] = [230, 245, 235];
const RESULT_BG: [number, number, number] = [200, 235, 210];
const CARD_BG: [number, number, number] = [240, 250, 242];
const CARD_RED_BG: [number, number, number] = [255, 235, 235];
const MUTED: [number, number, number] = [120, 120, 120];

// ─── Grouping Logic ───

interface GroupedData {
  headers: string[];
  /** Each group is an array of MonthlyProjection to be aggregated */
  groups: MonthlyProjection[][];
}

function groupProjections(projections: MonthlyProjection[], horizonte: number): GroupedData {
  if (horizonte <= 12) {
    return {
      headers: projections.map(p => `Mês ${p.month}`),
      groups: projections.map(p => [p]),
    };
  }

  let groupSize: number;
  let prefix: string;

  if (horizonte <= 24) {
    groupSize = 3;
    prefix = 'Tri';
  } else if (horizonte <= 48) {
    groupSize = 6;
    prefix = 'Sem';
  } else {
    groupSize = 12;
    prefix = 'Ano';
  }

  const groups: MonthlyProjection[][] = [];
  const headers: string[] = [];

  for (let i = 0; i < projections.length; i += groupSize) {
    const chunk = projections.slice(i, i + groupSize);
    groups.push(chunk);
    headers.push(`${prefix} ${groups.length}`);
  }

  return { headers, groups };
}

/** Sum a numeric field across a group of projections */
function sumField(projections: MonthlyProjection[], field: keyof MonthlyProjection): number {
  return projections.reduce((s, p) => s + (p[field] as number), 0);
}

function avgField(projections: MonthlyProjection[], field: keyof MonthlyProjection): number {
  if (projections.length === 0) return 0;
  return sumField(projections, field) / projections.length;
}

/** Get the last value of a field in a group (for stock-like metrics: MRR, clients acum) */
function lastField(projections: MonthlyProjection[], field: keyof MonthlyProjection): number {
  return projections.length > 0 ? (projections[projections.length - 1][field] as number) : 0;
}

// ─── Helpers ───
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

type RowStyle = 'header' | 'subtotal' | 'result' | 'detail' | 'percent';
interface DRERow { label: string; values: (string | number)[]; style: RowStyle; }

function buildDRERows(groups: MonthlyProjection[][], allProjections: MonthlyProjection[], state: SimulatorState): DRERow[] {
  const fc = formatCurrencyCompact;
  const fp = formatPercent;

  const row = (label: string, field: keyof MonthlyProjection, style: RowStyle = 'detail', isPercent = false): DRERow => {
    const vals = groups.map(g => isPercent ? fp(avgField(g, field)) : fc(sumField(g, field)));
    const total = isPercent ? fp(avgField(allProjections, field)) : fc(sumField(allProjections, field));
    return { label, values: [...vals, total], style };
  };

  const rows: DRERow[] = [];
  rows.push(row('= RECEITA BRUTA', 'receitaBrutaTotal', 'subtotal'));
  rows.push(row('   CAAS', 'receitaBrutaCaas'));
  rows.push(row('   SAAS', 'receitaBrutaSaas'));
  rows.push(row('      OXY+GENIO (recorrente)', 'receitaSaasOxyGenio'));
  rows.push(row('      SETUP (pontual)', 'receitaSetupTotal'));
  rows.push(row('   Diagnóstico (pontual)', 'receitaDiagPontual'));
  rows.push(row('   Receita Pré-existente', 'receitaPreExistente'));

  rows.push({ label: '(-) DEDUÇÕES', values: groups.map(g => fc(sumField(g, 'deducoesTotal'))).concat(fc(sumField(allProjections, 'deducoesTotal'))), style: 'subtotal' });
  // Show DAS or PIS/COFINS/ISS depending on regime
  const hasDAS = allProjections.some(p => p.deducaoDAS > 0);
  if (hasDAS) {
    rows.push(row('   DAS (Simples Nacional)', 'deducaoDAS'));
  } else {
    rows.push(row('   PIS', 'deducaoPIS'));
    rows.push(row('   COFINS', 'deducaoCOFINS'));
    rows.push(row('   ISSQN', 'deducaoISSQN'));
    rows.push(row('   ICMS', 'deducaoICMS'));
  }

  rows.push({ label: `(-) Royalties (${state.revenueRules.royalties}%)`, values: groups.map(g => fc(sumField(g, 'royaltiesValor'))).concat(fc(sumField(allProjections, 'royaltiesValor'))), style: 'subtotal' });
  rows.push(row('   Carga Total %', 'cargaTotalPercent', 'percent', true));
  rows.push(row('= RECEITA LÍQUIDA', 'receitaLiquida', 'result'));

  rows.push({ label: '(-) CUSTOS VARIÁVEIS', values: groups.map(g => fc(sumField(g, 'custosVariaveisTotal'))).concat(fc(sumField(allProjections, 'custosVariaveisTotal'))), style: 'subtotal' });
  rows.push(row('   Custos CAAS', 'custosCaas'));
  rows.push(row('   Custos SAAS', 'custosSaas'));

  rows.push(row('= MARGEM DE CONTRIBUIÇÃO', 'lucroBruto', 'result'));
  rows.push(row('   Margem Bruta %', 'margemBruta', 'percent', true));

  rows.push({ label: '(-) DESPESAS FIXAS', values: groups.map(g => fc(sumField(g, 'despFixasTotal'))).concat(fc(sumField(allProjections, 'despFixasTotal'))), style: 'subtotal' });
  rows.push(row('   Marketing', 'despMarketing'));
  rows.push(row('   Comerciais', 'despComerciais'));
  rows.push(row('   Pessoal / Pró-labore', 'despPessoal'));
  rows.push(row('   Administrativas', 'despAdm'));

  rows.push(row('= RESULTADO OPERACIONAL', 'ebitda', 'result'));
  rows.push(row('   Margem Operacional %', 'margemEbitda', 'percent', true));

  rows.push(row('(-) IRPJ / CSLL', 'irpjCsll', 'detail'));
  rows.push(row('(+) Receitas Financeiras', 'recFinanceiras', 'detail'));
  rows.push(row('(-) Despesas Financeiras', 'despFinanceiras', 'detail'));
  rows.push(row('= RESULTADO LÍQUIDO', 'resultadoLiquido', 'subtotal'));
  rows.push(row('   Margem Líquida %', 'margemLiquida', 'percent', true));

  rows.push(row('(-) Amortização', 'amortizacao', 'detail'));
  rows.push(row('(-) Investimentos', 'investimentos', 'detail'));
  rows.push(row('(-) Pró-labore (distribuição)', 'proLaboreDistribuicao', 'detail'));
  rows.push(row('= RESULTADO FINAL', 'resultadoFinal', 'result'));
  rows.push(row('   Margem Final %', 'margemFinal', 'percent', true));

  return rows;
}

// ─── Page Drawing Functions ───

function drawCoverPage(doc: any, state: SimulatorState, logo: string | null) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pageW, pageH, 'F');

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 6, pageH, 'F');

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.2);
  doc.line(20, 40, pageW - 20, 40);

  if (logo) {
    const logoW = 80;
    const logoH = 32.4;
    doc.addImage(logo, 'PNG', (pageW - logoW) / 2, 55, logoW, logoH);
  }

  doc.setFontSize(32);
  doc.setTextColor(...WHITE);
  doc.text('Plano Financeiro', pageW / 2, 110, { align: 'center' });

  doc.setFontSize(20);
  doc.setTextColor(...GREEN);
  doc.text(state.profile.nome || 'Simulação Financeira', pageW / 2, 125, { align: 'center' });

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.6);
  doc.line(pageW / 2 - 60, 135, pageW / 2 + 60, 135);

  doc.setFontSize(10);
  doc.setTextColor(180, 180, 180);
  doc.text(`Horizonte de projeção: ${state.horizonte} meses`, pageW / 2, pageH - 40, { align: 'center' });
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageW / 2, pageH - 32, { align: 'center' });

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.8);
  doc.line(20, pageH - 22, pageW - 20, pageH - 22);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('O2 Inc. — Simulador Financeiro', pageW / 2, pageH - 16, { align: 'center' });
}

function drawPageHeader(doc: any, logo: string | null, title: string) {
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 3, 'F');

  let headerY = 14;
  if (logo) {
    doc.addImage(logo, 'PNG', 14, headerY - 3, 32, 13);
  }
  const titleX = logo ? 50 : 14;
  doc.setFontSize(15);
  doc.setTextColor(...DARK);
  doc.text(title, titleX, headerY + 4);

  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.6);
  doc.line(14, headerY + 10, pageW - 14, headerY + 10);

  return headerY + 16;
}

function drawKPICard(doc: any, x: number, y: number, w: number, h: number, label: string, value: string, isNegative = false) {
  const bg = isNegative ? CARD_RED_BG : CARD_BG;
  const accentColor = isNegative ? [200, 50, 50] as [number, number, number] : GREEN_DARK;

  doc.setFillColor(...bg);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  doc.setFillColor(...accentColor);
  doc.rect(x, y + 3, 2.5, h - 6, 'F');

  doc.setFontSize(14);
  doc.setTextColor(...(isNegative ? [180, 30, 30] as [number, number, number] : GREEN_DARK));
  doc.text(value, x + w / 2, y + h / 2 - 1, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(label, x + w / 2, y + h / 2 + 7, { align: 'center' });
}

function drawExecutiveSummary(doc: any, state: SimulatorState, projections: MonthlyProjection[], logo: string | null) {
  doc.addPage('landscape');
  let y = drawPageHeader(doc, logo, `Resumo Executivo — Período: ${state.horizonte} meses`);
  const pageW = doc.internal.pageSize.getWidth();
  const fc = formatCurrencyCompact;

  const roi = calculateROI(state.investment, projections);
  const receitaTotal = sumField(projections, 'receitaBrutaTotal');
  const lucroBruto = sumField(projections, 'lucroBruto');
  const ebitdaTotal = sumField(projections, 'ebitda');
  const lucroLiquido = sumField(projections, 'resultadoLiquido');

  // ── KPI Cards (3×2) ──
  const cardW = 82;
  const cardH = 28;
  const gap = 10;
  const startX = (pageW - (3 * cardW + 2 * gap)) / 2;

  const kpis = [
    { label: 'Receita Bruta Total', value: fc(receitaTotal), neg: false },
    { label: 'Lucro Bruto', value: fc(lucroBruto), neg: lucroBruto < 0 },
    { label: 'EBITDA Total', value: fc(ebitdaTotal), neg: ebitdaTotal < 0 },
    { label: 'Lucro Líquido', value: fc(lucroLiquido), neg: lucroLiquido < 0 },
    { label: 'Payback', value: roi.paybackMeses >= 0 ? `${roi.paybackMeses} meses` : 'Não atingido', neg: roi.paybackMeses < 0 },
    { label: 'ROI Total', value: `${roi.roiTotal.toFixed(1)}%`, neg: roi.roiTotal < 0 },
  ];

  kpis.forEach((kpi, i) => {
    const col = i % 3;
    const rowIdx = Math.floor(i / 3);
    const cx = startX + col * (cardW + gap);
    const cy = y + rowIdx * (cardH + gap);
    drawKPICard(doc, cx, cy, cardW, cardH, kpi.label, kpi.value, kpi.neg);
  });

  y += 2 * (cardH + gap) + 6;

  // ── Bloco Vendas + Tickets (lado a lado) ──
  const blockW = (pageW - 28 - 10) / 2;
  doc.setFillColor(245, 248, 245);
  doc.roundedRect(14, y, blockW, 42, 3, 3, 'F');
  doc.roundedRect(14 + blockW + 10, y, blockW, 42, 3, 3, 'F');

  // -- Vendas --
  const vendasUnidade = (state.commercial.mix.caas || 0) + (state.commercial.mix.saas || 0) + (state.commercial.mix.diagnostico || 0);
  const vendasMatriz = state.matrixClients.qtdMensalInicial || 0;
  const vendasTotal = vendasUnidade + vendasMatriz;

  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Vendas', 22, y + 7);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(22, y + 9, 14 + blockW - 8, y + 9);

  const vendasItems = [
    `Vendas Unidade: ${vendasUnidade} /mês`,
    `Vendas Matriz: ${vendasMatriz} /mês`,
    `Vendas Total mensal: ${vendasTotal} /mês`,
  ];
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  let vy = y + 16;
  vendasItems.forEach(item => {
    doc.setFillColor(...GREEN);
    doc.circle(24, vy - 1, 1, 'F');
    doc.text(item, 28, vy);
    vy += 7;
  });

  // -- Tickets Médios --
  const ticketsX = 14 + blockW + 10;
  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Tickets Médios', ticketsX + 8, y + 7);
  doc.setDrawColor(...GREEN);
  doc.line(ticketsX + 8, y + 9, ticketsX + blockW - 8, y + 9);

  const findTicket = (key: string) => state.commercial.tickets.find(t => t.key === key)?.valor || 0;
  const ticketItems = [
    `Ticket CAAS: ${fc(findTicket('caas'))}`,
    `Ticket SAAS: ${fc(findTicket('saas'))}`,
    `Ticket Setup: ${fc(findTicket('setup'))}`,
    `Ticket Diagnóstico Estratégico: ${fc(findTicket('diagnostico'))}`,
  ];
  doc.setFontSize(7);
  doc.setTextColor(...DARK);
  let ty = y + 16;
  ticketItems.forEach(item => {
    doc.setFillColor(...GREEN);
    doc.circle(ticketsX + 10, ty - 1, 1, 'F');
    doc.text(item, ticketsX + 14, ty);
    ty += 7;
  });

  y += 48;

  // ── Principais Premissas P&L ──
  const plBlockH = 62;
  doc.setFillColor(245, 248, 245);
  doc.roundedRect(14, y, pageW - 28, plBlockH, 3, 3, 'F');

  doc.setFontSize(8.5);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Principais Premissas P&L', 22, y + 7);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(22, y + 9, pageW / 2, y + 9);

  const revShare = state.revenueRules.revenueShareSaaS;
  const royalties = state.revenueRules.royalties;
  const hasAmort = (state.belowEbitda.amortizacaoPMT || 0) > 0;
  const hasInvest = (state.belowEbitda.investimentosMensal || 0) > 0;

  const plPremissas: string[] = [
    `Receita CAAS: 100% Unidade`,
    `Receita SAAS: ${revShare}% de revenue share vindo da matriz`,
    `Royalties: ${royalties}% sobre receita bruta (exceto SAAS que já vem do revenue share)`,
    `Deduções: cálculo automático de acordo com regime tributário, produto e nível de faturamento`,
    `Custo variável CAAS: 25% da receita bruta (time de atendimento; começando com custo do sócio ou 25%, o que for maior)`,
    `Marketing: 5% ou custo de CAC, o que for maior`,
    `Comercial: 5% ou pró-labore sócio comercial, o que for maior`,
    `Administrativo: 5%`,
    `Despesa financeira: 1%`,
  ];
  if (hasAmort) plPremissas.push(`Amortização dívida: ${fc(state.belowEbitda.amortizacaoPMT)}/mês`);
  if (hasInvest) plPremissas.push(`Investimentos: ${fc(state.belowEbitda.investimentosMensal)}/mês`);

  doc.setFontSize(6.5);
  doc.setTextColor(...DARK);

  // Render in 2 columns
  const colMid = Math.ceil(plPremissas.length / 2);
  const leftItems = plPremissas.slice(0, colMid);
  const rightItems = plPremissas.slice(colMid);

  let py = y + 16;
  leftItems.forEach(item => {
    doc.setFillColor(...GREEN);
    doc.circle(24, py - 1, 1, 'F');
    const lines = doc.splitTextToSize(item, blockW - 20);
    doc.text(lines, 28, py);
    py += lines.length * 4.5 + 1.5;
  });

  let py2 = y + 16;
  const rightX = pageW / 2 + 10;
  rightItems.forEach(item => {
    doc.setFillColor(...GREEN);
    doc.circle(rightX, py2 - 1, 1, 'F');
    const lines = doc.splitTextToSize(item, blockW - 20);
    doc.text(lines, rightX + 4, py2);
    py2 += lines.length * 4.5 + 1.5;
  });

  y += plBlockH + 6;

  // ── Payback bar ──
  doc.setFontSize(9);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Indicador de Payback', 22, y);
  y += 5;

  const barW = pageW - 60;
  const barH = 8;
  const barX = 22;

  doc.setFillColor(220, 225, 220);
  doc.roundedRect(barX, y, barW, barH, 2, 2, 'F');

  const maxMonths = state.horizonte;
  const paybackFrac = roi.paybackMeses >= 0 ? Math.min(roi.paybackMeses / maxMonths, 1) : 1;
  const fillColor = roi.paybackMeses >= 0 ? GREEN : [200, 50, 50] as [number, number, number];
  doc.setFillColor(...fillColor);
  doc.roundedRect(barX, y, barW * paybackFrac, barH, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  const paybackLabel = roi.paybackMeses >= 0 ? `${roi.paybackMeses} meses` : 'Não atingido no horizonte';
  doc.text(paybackLabel, barX + barW * paybackFrac / 2, y + 5.5, { align: 'center' });

  doc.setTextColor(...MUTED);
  doc.text(`${maxMonths} meses`, barX + barW + 3, y + 5.5);
}

function drawDREPage(doc: any, state: SimulatorState, projections: MonthlyProjection[], logo: string | null) {
  doc.addPage('landscape');
  const y = drawPageHeader(doc, logo, 'DRE Gerencial');

  const { headers: groupHeaders, groups } = groupProjections(projections, state.horizonte);
  const dreRows = buildDRERows(groups, projections, state);
  const headers = ['', ...groupHeaders, 'Total'];
  const body = dreRows.map(r => [r.label, ...r.values]);

  const numCols = headers.length;
  const fontSize = numCols <= 14 ? 5.5 : 5;
  const cellPadding = numCols <= 14 ? 1.2 : 0.8;
  const labelWidth = numCols <= 14 ? 38 : 34;

  const { default: autoTable } = (window as any).__autoTableModule;

  // Grouping footnote
  let groupNote = '';
  if (state.horizonte > 12 && state.horizonte <= 24) groupNote = 'Dados agrupados trimestralmente';
  else if (state.horizonte > 24 && state.horizonte <= 48) groupNote = 'Dados agrupados semestralmente';
  else if (state.horizonte > 48) groupNote = 'Dados agrupados anualmente';

  autoTable(doc, {
    startY: y,
    head: [headers],
    body,
    styles: { fontSize, cellPadding, textColor: DARK, overflow: 'ellipsize' },
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontSize: fontSize + 0.5, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 0: { cellWidth: labelWidth, fontStyle: 'normal', halign: 'left' } },
    didParseCell: (data: any) => {
      if (data.section !== 'body') return;
      const dreRow = dreRows[data.row.index];
      if (!dreRow) return;

      if (dreRow.style === 'subtotal') {
        data.cell.styles.fillColor = SUBTOTAL_BG;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = fontSize + 0.3;
      }
      if (dreRow.style === 'result') {
        data.cell.styles.fillColor = RESULT_BG;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = fontSize + 0.5;
      }
      if (dreRow.style === 'percent') {
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [80, 80, 80];
      }
      if (data.column.index === headers.length - 1 && data.column.index > 0) {
        const bg = Array.isArray(data.cell.styles.fillColor) ? data.cell.styles.fillColor : [255, 255, 255];
        data.cell.styles.fillColor = [Math.max(bg[0] - 10, 200), Math.max(bg[1] - 5, 220), Math.max(bg[2] - 10, 200)];
      }
      if (data.column.index > 0) {
        const raw = String(data.cell.raw);
        if (raw.includes('-') && !raw.startsWith('(') && !raw.startsWith(' ')) {
          data.cell.styles.textColor = [180, 30, 30];
        }
        data.cell.styles.halign = 'right';
      }
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  });

  if (groupNote) {
    const pageW = doc.internal.pageSize.getWidth();
    const tableEndY = (doc as any).lastAutoTable?.finalY || 180;
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`* ${groupNote}. Valores monetários somados; percentuais são médias do período.`, pageW / 2, tableEndY + 5, { align: 'center' });
  }
}

function drawMRRPage(doc: any, state: SimulatorState, projections: MonthlyProjection[], logo: string | null) {
  doc.addPage('landscape');
  const y = drawPageHeader(doc, logo, 'Evolução MRR e Base de Clientes');

  const { default: autoTable } = (window as any).__autoTableModule;
  const { headers: groupHeaders, groups } = groupProjections(projections, state.horizonte);

  const fc = formatCurrencyCompact;
  const mrrHeaders = ['', 'MRR Franquia', 'MRR Matriz', 'MRR Total', 'Churn Total', 'MRR Total Líquido', 'Novos Clientes Mês (Total)', 'Clientes Acumulados (Total)'];

  const mrrBody = groups.map((g, i) => {
    const mrrFranquia = lastField(g, 'mrrCaasOwn') + lastField(g, 'mrrSaasOwn');
    const mrrMatriz = lastField(g, 'mrrMatriz');
    const mrrTotalBruto = mrrFranquia + mrrMatriz;
    return [
      groupHeaders[i],
      fc(mrrFranquia),
      fc(mrrMatriz),
      fc(mrrTotalBruto),
      fc(sumField(g, 'churnValor')),
      fc(lastField(g, 'mrrTotal')),
      sumField(g, 'clientesCompradosMes'),
      lastField(g, 'clientesCompradosAcum'),
    ];
  });

  // Add total row
  const lastP = projections[projections.length - 1];
  const totalMrrFranquia = lastP.mrrCaasOwn + lastP.mrrSaasOwn;
  const totalMrrBruto = totalMrrFranquia + lastP.mrrMatriz;
  mrrBody.push([
    'Total',
    fc(totalMrrFranquia),
    fc(lastP.mrrMatriz),
    fc(totalMrrBruto),
    fc(sumField(projections, 'churnValor')),
    fc(lastP.mrrTotal),
    sumField(projections, 'clientesCompradosMes'),
    lastP.clientesCompradosAcum,
  ]);

  const numRows = mrrBody.length;
  const fontSize = groups.length <= 12 ? 7 : 6;

  autoTable(doc, {
    startY: y,
    head: [mrrHeaders],
    body: mrrBody,
    styles: { fontSize, cellPadding: 1.5, textColor: DARK, overflow: 'ellipsize' },
    headStyles: { fillColor: GREEN_DARK, textColor: WHITE, fontSize: fontSize + 0.5, fontStyle: 'bold', halign: 'center' },
    columnStyles: { 0: { fontStyle: 'bold' } },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    didParseCell: (data: any) => {
      // Style total row
      if (data.section === 'body' && data.row.index === numRows - 1) {
        data.cell.styles.fillColor = RESULT_BG;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 10, right: 10 },
  });

  // ─── Glossário explicativo ───
  const tableEndY = (doc as any).lastAutoTable?.finalY ?? 120;
  const revenueShare = state.revenueRules?.revenueShareSaaS ?? 30;
  const pageW = doc.internal.pageSize.getWidth();

  const glossary: [string, string][] = [
    ['MRR Franquia', 'Receita recorrente mensal da unidade: soma de MRR CAAS (CFO as a Service) + MRR SAAS (revenue share do OXY+GENIO).'],
    ['MRR Matriz', 'MRR gerado por clientes adquiridos via inbound da matriz, acumulado e líquido de churn.'],
    ['MRR Total', 'Soma bruta de MRR Franquia + MRR Matriz, antes da dedução do churn.'],
    ['Churn Total', 'Valor monetário da perda mensal de receita recorrente, aplicando a taxa de churn sobre o MRR total do período anterior.'],
    ['MRR Total Líquido', 'MRR Total após dedução do churn mensal. Representa a receita recorrente efetiva.'],
    ['Novos Clientes Mês (Total)', 'Quantidade de novos clientes adquiridos no período: vendas próprias da unidade + clientes comprados da matriz.'],
    ['Clientes Acumulados (Total)', 'Base acumulada de clientes ativos ao final do período: carteira inicial + clientes totais conquistados − churn.'],
  ];

  let gy = tableEndY + 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Glossário — Base de Cálculo', 10, gy);
  gy += 4;

  doc.setFontSize(6.5);
  glossary.forEach(([term, desc]) => {
    if (gy > doc.internal.pageSize.getHeight() - 10) {
      doc.addPage('landscape');
      gy = 15;
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GREEN_DARK);
    doc.text('•', 12, gy);
    doc.text(`${term}:`, 15, gy);
    const termWidth = doc.getTextWidth(`${term}: `);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    const descLines = doc.splitTextToSize(desc, pageW - 15 - termWidth - 12);
    doc.text(descLines, 15 + termWidth, gy);
    gy += descLines.length * 3.2;
  });
}

function drawROIPage(doc: any, state: SimulatorState, projections: MonthlyProjection[], logo: string | null) {
  doc.addPage('landscape');
  let y = drawPageHeader(doc, logo, 'Análise de Retorno do Investimento');
  const pageW = doc.internal.pageSize.getWidth();
  const fc = formatCurrencyCompact;

  const roi = calculateROI(state.investment, projections);
  const inv = state.investment;

  const leftW = (pageW - 42) / 2;
  const rightX = 14 + leftW + 14;

  doc.setFillColor(245, 248, 245);
  doc.roundedRect(14, y, leftW, 110, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Investimento Detalhado', 22, y + 10);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(22, y + 13, 14 + leftW - 10, y + 13);

  // Investment items with descriptions
  type InvestItem = { label: string; value: string; desc?: string };
  const investItems: InvestItem[] = [
    {
      label: 'Taxa de Franquia',
      value: fc(roi.taxaFinal),
      desc: inv.cupomAplicado
        ? `Valor original: ${fc(190000)} — Cupom: ${inv.cupom} — Desconto: ${fc(190000 - roi.taxaFinal)}`
        : `Valor: ${fc(roi.taxaFinal)}`,
    },
    { label: 'Implantação', value: fc(inv.implantacao) },
    { label: 'Marketing Inicial', value: fc(inv.marketingInicial), desc: 'Evento de lançamento, Mídias, Parcerias, Patrocínios e/ou compra de mais clientes (CAC).' },
    { label: 'Equipamentos', value: fc(inv.equipamentos), desc: 'Mesa, computador, televisão, etc.' },
    { label: 'Outros', value: fc(inv.outros) },
    { label: 'Capital de Giro (sugerido)', value: fc(roi.capitalGiro), desc: 'Gap dos primeiros meses para suportar período de prejuízo.' },
  ];

  doc.setFontSize(8);
  let iy = y + 22;
  investItems.forEach((item) => {
    doc.setTextColor(...DARK);
    doc.text(item.label, 24, iy);
    doc.setTextColor(...MUTED);
    doc.text(item.value, 14 + leftW - 12, iy, { align: 'right' });
    if (item.desc) {
      iy += 4;
      doc.setFontSize(6.5);
      doc.setTextColor(140, 140, 140);
      const descLines = doc.splitTextToSize(item.desc, leftW - 30);
      doc.text(descLines, 26, iy);
      iy += descLines.length * 3;
      doc.setFontSize(8);
    }
    iy += 7;
  });

  doc.setDrawColor(...GREEN_DARK);
  doc.setLineWidth(0.5);
  doc.line(22, iy, 14 + leftW - 10, iy);
  iy += 7;
  doc.setFontSize(11);
  doc.setTextColor(...GREEN_DARK);
  doc.text('INVESTIMENTO TOTAL', 24, iy);
  doc.text(fc(roi.totalInvestimento), 14 + leftW - 12, iy, { align: 'right' });
  iy += 4;
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Todos investimentos + Capital de giro sugerido.', 26, iy);

  // ─── Right card: Indicadores de Retorno ───
  doc.setFillColor(245, 248, 245);
  doc.roundedRect(rightX, y, leftW, 110, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setTextColor(...GREEN_DARK);
  doc.text('Indicadores de Retorno', rightX + 8, y + 10);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(rightX + 8, y + 13, rightX + leftW - 10, y + 13);

  const roiCardY = y + 20;
  const roiCardW = (leftW - 20) / 2;

  drawROIIndicator(doc, rightX + 5, roiCardY, roiCardW, 25, 'ROI Direto', `${roi.roiDireto.toFixed(1)}%`, roi.roiDireto >= 0);
  drawROIIndicator(doc, rightX + 10 + roiCardW, roiCardY, roiCardW, 25, 'ROI Total', `${roi.roiTotal.toFixed(1)}%`, roi.roiTotal >= 0);

  // ROI subtexts
  let roiDescY = roiCardY + 28;
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('ROI Direto = Resultado Anual (12m) ÷ Taxa de Franquia × 100', rightX + 8, roiDescY);
  roiDescY += 4;
  doc.text('ROI Total = Resultado Anual (12m) ÷ Investimento Total × 100', rightX + 8, roiDescY);

  const pbY = roiDescY + 10;
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text('Payback', rightX + 8, pbY);

  const paybackOk = roi.paybackMeses >= 0;
  doc.setFillColor(...(paybackOk ? GREEN : [200, 50, 50] as [number, number, number]));
  doc.circle(rightX + leftW - 15, pbY - 2, 4, 'F');
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(paybackOk ? '✓' : '✗', rightX + leftW - 15, pbY - 0.5, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(...(paybackOk ? GREEN_DARK : [180, 30, 30] as [number, number, number]));
  doc.text(paybackOk ? `${roi.paybackMeses} meses` : 'Não atingido', rightX + 8, pbY + 10);

  // Payback description
  doc.setFontSize(6.5);
  doc.setTextColor(140, 140, 140);
  doc.text('Tempo até o Lucro Líquido acumulado pagar o INVESTIMENTO TOTAL.', rightX + 8, pbY + 16);

  const bottomY = y + 120;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(14, bottomY, pageW - 14, bottomY);

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(
    'Simulação gerada por O2 Inc. — Este documento é uma projeção financeira e não constitui garantia de resultados. Os valores apresentados são estimativas baseadas nas premissas configuradas.',
    pageW / 2, bottomY + 6, { align: 'center', maxWidth: pageW - 40 }
  );
}

function drawROIIndicator(doc: any, x: number, y: number, w: number, h: number, label: string, value: string, positive: boolean) {
  const bg = positive ? CARD_BG : CARD_RED_BG;
  doc.setFillColor(...bg);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  doc.setFontSize(16);
  doc.setTextColor(...(positive ? GREEN_DARK : [180, 30, 30] as [number, number, number]));
  doc.text(value, x + w / 2, y + h / 2, { align: 'center' });

  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(label, x + w / 2, y + h / 2 + 7, { align: 'center' });
}

function addFooter(doc: any) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 12, pageW - 14, pageH - 12);

    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(`O2 Inc. Simulador Financeiro  •  ${new Date().toLocaleString('pt-BR')}`, 14, pageH - 7);
    doc.text(`Página ${i - 1} de ${pageCount - 1}`, pageW - 35, pageH - 7);
  }
}

// ─── Main Export ───
export async function exportPDF(state: SimulatorState, projections: MonthlyProjection[]) {
  const { default: jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  (window as any).__autoTableModule = autoTableModule;

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const logo = await loadLogoAsDataUrl();

  drawCoverPage(doc, state, logo);
  drawExecutiveSummary(doc, state, projections, logo);
  drawDREPage(doc, state, projections, logo);
  drawMRRPage(doc, state, projections, logo);
  drawROIPage(doc, state, projections, logo);
  addFooter(doc);

  delete (window as any).__autoTableModule;

  doc.save('simulacao-o2.pdf');
}
