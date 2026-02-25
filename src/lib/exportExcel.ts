import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatCurrency } from '@/lib/formatters';
import { calculateROI } from '@/lib/financial';

type CellValue = string | number;
type Row = CellValue[];

function buildDRESheet(projections: MonthlyProjection[], state: SimulatorState): { data: Row[]; subtotalRows: number[]; resultRows: number[]; percentRows: number[] } {
  const months = projections.length;
  const subtotalRows: number[] = [];
  const resultRows: number[] = [];
  const percentRows: number[] = [];

  // Helper to sum a field across all projections
  const sum = (field: keyof MonthlyProjection) => projections.reduce((s, p) => s + (p[field] as number), 0);
  const avg = (field: keyof MonthlyProjection) => sum(field) / months;

  // Header row
  const header: Row = ['DRE Gerencial', ...projections.map(p => `Mês ${p.month}`), 'Total'];

  const data: Row[] = [header];

  const addRow = (label: string, field: keyof MonthlyProjection, type: 'detail' | 'subtotal' | 'result' | 'percent' = 'detail', isPercent = false) => {
    const vals = projections.map(p => p[field] as number);
    const total = isPercent ? avg(field) : sum(field);
    data.push([label, ...vals, total]);
    const idx = data.length - 1;
    if (type === 'subtotal') subtotalRows.push(idx);
    if (type === 'result') resultRows.push(idx);
    if (type === 'percent') percentRows.push(idx);
  };

  addRow('= RECEITA BRUTA', 'receitaBrutaTotal', 'subtotal');
  addRow('   CAAS', 'receitaBrutaCaas');
  addRow('   SAAS', 'receitaBrutaSaas');
  addRow('   Education', 'receitaBrutaEducation');
  addRow('   Expansão', 'receitaBrutaExpansao');
  addRow('   Tax', 'receitaBrutaTax');
  addRow('   Setup (pontual)', 'receitaSetupPontual');
  addRow('   Diagnóstico (pontual)', 'receitaDiagPontual');
  addRow('   Receita Pré-existente', 'receitaPreExistente');

  addRow('(-) DEDUÇÕES', 'deducoesTotal', 'subtotal');
  addRow('   PIS', 'deducaoPIS');
  addRow('   COFINS', 'deducaoCOFINS');
  addRow('   ISSQN', 'deducaoISSQN');
  addRow('   ICMS', 'deducaoICMS');

  addRow(`(-) Royalties (${state.revenueRules.royalties}%)`, 'royaltiesValor', 'subtotal');
  addRow('   Carga Total %', 'cargaTotalPercent', 'percent', true);
  addRow('= RECEITA LÍQUIDA', 'receitaLiquida', 'result');

  addRow('(-) CUSTOS VARIÁVEIS', 'custosVariaveisTotal', 'subtotal');
  addRow('   Custos CAAS', 'custosCaas');
  addRow('   Custos SAAS', 'custosSaas');
  addRow('   Custos Education', 'custosEducation');
  addRow('   Custos CS', 'custosCS');
  addRow('   Custos Expansão', 'custosExpansao');
  addRow('   Custos Tax', 'custosTax');
  addRow('   CAC Total', 'cacTotal');

  addRow('= MARGEM DE CONTRIBUIÇÃO', 'lucroBruto', 'result');
  addRow('   Margem Bruta %', 'margemBruta', 'percent', true);

  addRow('(-) DESPESAS FIXAS', 'despFixasTotal', 'subtotal');
  addRow('   Marketing', 'despMarketing');
  addRow('   Comerciais', 'despComerciais');
  addRow('   Pessoal / Pró-labore', 'despPessoal');
  addRow('   Administrativas', 'despAdm');

  addRow('= RESULTADO OPERACIONAL', 'ebitda', 'result');
  addRow('   Margem Operacional %', 'margemEbitda', 'percent', true);

  addRow('(-) IRPJ / CSLL', 'irpjCsll');
  addRow('(+) Receitas Financeiras', 'recFinanceiras');
  addRow('(-) Despesas Financeiras', 'despFinanceiras');
  addRow('= RESULTADO LÍQUIDO', 'resultadoLiquido', 'subtotal');

  addRow('(-) Amortização', 'amortizacao');
  addRow('(-) Investimentos', 'investimentos');
  addRow('= RESULTADO FINAL', 'resultadoFinal', 'result');

  return { data, subtotalRows, resultRows, percentRows };
}

function buildMRRSheet(projections: MonthlyProjection[]): Row[] {
  const header: Row = ['MRR e Clientes', ...projections.map(p => `Mês ${p.month}`)];
  const sum = (field: keyof MonthlyProjection) => projections.reduce((s, p) => s + (p[field] as number), 0);
  const last = (field: keyof MonthlyProjection) => projections[projections.length - 1][field] as number;

  const rows: Row[] = [header];

  const addRow = (label: string, vals: number[]) => {
    rows.push([label, ...vals]);
  };

  addRow('MRR CAAS', projections.map(p => p.mrrCaasOwn));
  addRow('MRR SAAS', projections.map(p => p.mrrSaasOwn));
  addRow('MRR Matriz', projections.map(p => p.mrrMatriz));
  addRow('MRR Total', projections.map(p => p.mrrTotal));
  rows.push([]); // blank line
  addRow('Churn R$', projections.map(p => p.churnValor));
  addRow('Clientes no Mês', projections.map(p => p.clientesCompradosMes));
  addRow('Clientes Acumulados', projections.map(p => p.clientesCompradosAcum));
  addRow('Setup Matriz', projections.map(p => p.setupMatriz));

  return rows;
}

function buildROISheet(state: SimulatorState, projections: MonthlyProjection[]): Row[] {
  const roi = calculateROI(state.investment, projections);
  const inv = state.investment;
  const fc = formatCurrency;

  const rows: Row[] = [];

  rows.push(['INVESTIMENTO DETALHADO', '', '']);
  rows.push([]);
  rows.push(['Item', 'Valor']);
  rows.push(['Taxa de Franquia', roi.taxaFinal]);
  rows.push(['Implantação', inv.implantacao]);
  rows.push(['Marketing Inicial', inv.marketingInicial]);
  rows.push(['Equipamentos', inv.equipamentos]);
  rows.push(['Outros', inv.outros]);
  rows.push(['Capital de Giro (sugerido)', roi.capitalGiro]);
  rows.push(['INVESTIMENTO TOTAL', roi.totalInvestimento]);
  rows.push([]);
  rows.push(['INDICADORES DE RETORNO', '', '']);
  rows.push([]);
  rows.push(['Indicador', 'Valor']);
  rows.push(['ROI Direto', `${roi.roiDireto.toFixed(1)}%`]);
  rows.push(['ROI Total', `${roi.roiTotal.toFixed(1)}%`]);
  rows.push(['Payback', roi.paybackMeses >= 0 ? `${roi.paybackMeses} meses` : 'Não atingido']);
  rows.push([]);
  rows.push(['PREMISSAS PRINCIPAIS', '', '']);
  rows.push([]);
  rows.push(['Premissa', 'Valor']);
  rows.push(['Vendas / mês', state.commercial.compromissoMensal]);
  rows.push(['Ticket CAAS', state.commercial.tickets.find(t => t.key === 'caas')?.valor || 0]);
  rows.push(['Ticket SAAS', state.commercial.tickets.find(t => t.key === 'saas')?.valor || 0]);
  rows.push(['Churn mensal', `${state.churn.churnMensal}%`]);
  rows.push(['Royalties', `${state.revenueRules.royalties}%`]);
  rows.push(['Rev. Share SaaS', `${state.revenueRules.revenueShareSaaS}%`]);
  rows.push(['Horizonte', `${state.horizonte} meses`]);
  rows.push(['Pró-labore desejado', state.goals.proLaboreDesejado]);

  return rows;
}

export async function exportExcel(state: SimulatorState, projections: MonthlyProjection[]) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: DRE Gerencial ──
  const { data: dreData, subtotalRows, resultRows, percentRows } = buildDRESheet(projections, state);
  const wsDRE = XLSX.utils.aoa_to_sheet(dreData);

  // Column widths
  const numCols = dreData[0].length;
  wsDRE['!cols'] = [{ wch: 30 }, ...Array(numCols - 1).fill({ wch: 16 })];

  // Number format for monetary cells
  for (let r = 1; r < dreData.length; r++) {
    for (let c = 1; c < numCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = wsDRE[cellRef];
      if (cell && typeof cell.v === 'number') {
        if (percentRows.includes(r)) {
          cell.z = '0.00%';
          cell.v = cell.v / 100; // convert to decimal for percentage format
        } else {
          cell.z = '#,##0.00';
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsDRE, 'DRE Gerencial');

  // ── Sheet 2: MRR e Clientes ──
  const mrrData = buildMRRSheet(projections);
  const wsMRR = XLSX.utils.aoa_to_sheet(mrrData);
  const mrrCols = mrrData[0].length;
  wsMRR['!cols'] = [{ wch: 22 }, ...Array(mrrCols - 1).fill({ wch: 16 })];

  // Number format
  for (let r = 1; r < mrrData.length; r++) {
    for (let c = 1; c < mrrCols; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = wsMRR[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.z = '#,##0.00';
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsMRR, 'MRR e Clientes');

  // ── Sheet 3: ROI e Investimento ──
  const roiData = buildROISheet(state, projections);
  const wsROI = XLSX.utils.aoa_to_sheet(roiData);
  wsROI['!cols'] = [{ wch: 30 }, { wch: 20 }];

  // Number format for investment values
  for (let r = 0; r < roiData.length; r++) {
    for (let c = 1; c < (roiData[r]?.length || 0); c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      const cell = wsROI[cellRef];
      if (cell && typeof cell.v === 'number') {
        cell.z = '#,##0.00';
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, wsROI, 'ROI e Investimento');

  XLSX.writeFile(wb, 'simulacao-o2.xlsx');
}
