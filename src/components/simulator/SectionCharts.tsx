import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from './SectionHeader';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { calculateROI } from '@/lib/financial';
import { TrendingUp, Target, DollarSign } from 'lucide-react';
import type { MonthlyProjection, InvestmentData } from '@/types/simulator';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine, Cell,
} from 'recharts';

interface Props {
  projections: MonthlyProjection[];
  investment: InvestmentData;
}

// Custom tooltip for DRE lines chart showing value + % of revenue
function DRETooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const receitaBruta = payload.find((p: any) => p.dataKey === 'Receita Bruta')?.value || 1;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: any) => {
        const pct = receitaBruta ? (entry.value / receitaBruta) * 100 : 0;
        return (
          <p key={entry.dataKey} style={{ color: entry.color }} className="flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-medium">
              {formatCurrency(entry.value)} ({pct.toFixed(1)}%)
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function SectionCharts({ projections, investment }: Props) {
  const [retornoMetrica, setRetornoMetrica] = useState<'resultadoFinal' | 'receitaBrutaTotal'>('receitaBrutaTotal');

  if (projections.length === 0) return null;

  const { totalInvestimento, roiTotal, paybackMeses } = calculateROI(investment, projections);

  // 1. Retorno acumulado vs investimento (toggle metric)
  let acum = 0;
  const metricLabel = retornoMetrica === 'receitaBrutaTotal' ? 'Receita Bruta Acum.' : 'Lucro Líquido Acum.';
  const retornoData = projections.map(p => {
    acum += p[retornoMetrica];
    return { mes: `M${p.month}`, retornoAcum: acum, investimento: totalInvestimento };
  });

  // 2. Resultado mensal
  const resultadoMensal = projections.map(p => ({
    mes: `M${p.month}`,
    resultado: p.resultadoFinal,
  }));

  // 3. Receita e MRR
  const receitaMrr = projections.map(p => ({
    mes: `M${p.month}`,
    receita: p.receitaBrutaTotal,
    mrr: p.mrrTotal,
  }));

  // 4. Composição de receita
  const composicao = projections.map(p => ({
    mes: `M${p.month}`,
    CAAS: p.receitaBrutaCaas,
    SAAS: p.receitaBrutaSaas - p.receitaSetupPontual,
    Setup: p.receitaSetupPontual,
    'Diagnóstico/Expansão': p.receitaBrutaExpansao,
  }));

  // 5. DRE Line Chart
  const dreLines = projections.map(p => ({
    mes: `M${p.month}`,
    'Receita Bruta': p.receitaBrutaTotal,
    'Margem Contribuição': p.lucroBruto,
    EBITDA: p.ebitda,
    'Resultado Líquido': p.resultadoLiquido,
    'Resultado Final': p.resultadoFinal,
  }));

  let retornoFinal = 0;
  projections.forEach(p => retornoFinal += p.resultadoFinal);

  const tooltipFormatter = (value: number) => formatCurrency(value);

  return (
    <section>
      <SectionHeader number={13} title="Gráficos de Resultados" description="Visualização da evolução financeira e payback" />

      {/* KPI Payback highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-primary">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Payback Projetado</p>
            <p className="text-2xl font-bold text-primary">{paybackMeses > 0 ? `${paybackMeses.toFixed(2)} meses` : '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground">Retorno Acumulado ({projections.length}m)</p>
            <p className="text-2xl font-bold">{formatCurrency(retornoFinal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-xs text-muted-foreground">ROI Total no Horizonte</p>
            <p className="text-2xl font-bold">{formatPercent(roiTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Retorno Acumulado vs Investimento */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold">Retorno Acumulado vs Investimento Inicial</h4>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={retornoMetrica === 'receitaBrutaTotal' ? 'default' : 'outline'}
                onClick={() => setRetornoMetrica('receitaBrutaTotal')}
                className="text-xs h-7 px-3"
              >
                Receita Bruta
              </Button>
              <Button
                size="sm"
                variant={retornoMetrica === 'resultadoFinal' ? 'default' : 'outline'}
                onClick={() => setRetornoMetrica('resultadoFinal')}
                className="text-xs h-7 px-3"
              >
                Lucro Líquido
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retornoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="retornoAcum" name={metricLabel} stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="investimento" name="Investimento" stroke="hsl(0, 84%, 60%)" strokeWidth={2} strokeDasharray="8 4" dot={false} />
              {paybackMeses > 0 && (
                <ReferenceLine x={`M${Math.ceil(paybackMeses)}`} stroke="hsl(142, 76%, 36%)" strokeWidth={2} strokeDasharray="4 4" label={{ value: `Payback ~${paybackMeses.toFixed(1)}m`, position: 'top', fontSize: 11 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 5: DRE Lines */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Evolução das Linhas do DRE</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dreLines}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip content={<DRETooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="Receita Bruta" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="Margem Contribuição" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="EBITDA" stroke="hsl(45, 93%, 47%)" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="Resultado Líquido" stroke="hsl(280, 60%, 50%)" strokeWidth={2} dot={false} connectNulls strokeDasharray="6 3" />
              <Line type="monotone" dataKey="Resultado Final" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={false} connectNulls strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Resultado Mensal */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Resultado Mensal</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resultadoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="resultado" name="Resultado Final">
                {resultadoMensal.map((entry, index) => (
                  <Cell key={index} fill={entry.resultado >= 0 ? 'hsl(142, 76%, 36%)' : 'hsl(0, 84%, 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Receita e MRR */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Evolução da Receita e MRR</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={receitaMrr}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="receita" name="Receita Total" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mrr" name="MRR Total" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Composição de receita */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Composição de Receita por Produto</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={composicao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Area type="monotone" dataKey="CAAS" stackId="1" fill="hsl(142, 76%, 36%)" stroke="hsl(142, 76%, 36%)" fillOpacity={0.7} />
              <Area type="monotone" dataKey="SAAS" stackId="1" fill="hsl(200, 80%, 50%)" stroke="hsl(200, 80%, 50%)" fillOpacity={0.7} />
              <Area type="monotone" dataKey="Setup" stackId="1" fill="hsl(45, 93%, 47%)" stroke="hsl(45, 93%, 47%)" fillOpacity={0.7} />
              <Area type="monotone" dataKey="Diagnóstico/Expansão" stackId="1" fill="hsl(280, 60%, 50%)" stroke="hsl(280, 60%, 50%)" fillOpacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}
