import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from './SectionHeader';
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

export function SectionCharts({ projections, investment }: Props) {
  if (projections.length === 0) return null;

  const { totalInvestimento, roiAnual, paybackMeses } = calculateROI(investment, projections);

  // 1. Retorno acumulado vs investimento
  let acum = 0;
  const retornoData = projections.map(p => {
    acum += p.resultadoFinal;
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
    mrr: p.mrrFinal,
  }));

  // 4. Composição de receita
  const composicao = projections.map(p => ({
    mes: `M${p.month}`,
    CAAS: p.receitaBrutaCaas,
    SAAS: p.receitaBrutaSaas,
    Setup: p.receitaBrutaSetup,
    'Diagnóstico/Expansão': p.receitaBrutaExpansao + p.receitaBrutaEducation,
  }));

  const last = projections[projections.length - 1];
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
            <p className="text-2xl font-bold text-primary">{paybackMeses > 0 ? `${paybackMeses} meses` : '—'}</p>
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
            <p className="text-xs text-muted-foreground">ROI no Horizonte</p>
            <p className="text-2xl font-bold">{formatPercent(roiAnual)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart 1: Retorno Acumulado vs Investimento */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-4">Retorno Acumulado vs Investimento Inicial</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retornoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line type="monotone" dataKey="retornoAcum" name="Retorno Acumulado" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="investimento" name="Investimento" stroke="hsl(0, 84%, 60%)" strokeWidth={2} strokeDasharray="8 4" dot={false} />
              {paybackMeses > 0 && (
                <ReferenceLine x={`M${paybackMeses}`} stroke="hsl(142, 76%, 36%)" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Payback', position: 'top', fontSize: 11 }} />
              )}
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
              <Line type="monotone" dataKey="mrr" name="MRR" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={false} />
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
