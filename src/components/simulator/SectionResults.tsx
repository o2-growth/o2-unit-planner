import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionHeader } from './SectionHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { MonthlyProjection, InvestmentData } from '@/types/simulator';
import { calculateROI } from '@/lib/financial';

interface Props {
  projections: MonthlyProjection[];
  investment: InvestmentData;
  metaROIMeses: number;
  churnMensal: number;
}

export function SectionResults({ projections, investment, metaROIMeses, churnMensal }: Props) {
  if (projections.length === 0) return null;

  const total = (key: keyof MonthlyProjection) => projections.reduce((s, p) => s + (p[key] as number), 0);
  const last = projections[projections.length - 1];
  const { roiAnual, paybackMeses } = calculateROI(investment, projections);

  const kpis = [
    { label: 'Receita Bruta Total', value: formatCurrency(total('receitaBrutaTotal')) },
    { label: 'Receita Líquida', value: formatCurrency(total('receitaLiquida')) },
    { label: 'MRR Final Projetado', value: formatCurrency(last.mrrFinal) },
    { label: 'Churn Mensal', value: formatPercent(churnMensal) },
    { label: 'Lucro Bruto', value: formatCurrency(total('lucroBruto')) },
    { label: 'EBITDA Total', value: formatCurrency(total('ebitda')) },
    { label: 'Margem EBITDA', value: formatPercent(total('ebitda') / (total('receitaBrutaTotal') || 1) * 100) },
    { label: 'Resultado Líquido', value: formatCurrency(total('resultadoLiquido')) },
    { label: 'Resultado Final', value: formatCurrency(total('resultadoFinal')) },
    { label: 'ROI Anual', value: formatPercent(roiAnual) },
    { label: 'Payback', value: paybackMeses > 0 ? `${paybackMeses} meses` : '—' },
  ];

  return (
    <section>
      <SectionHeader number={14} title="Resultados da Simulação" description="Visão consolidada dos principais indicadores" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="border-primary/20">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-lg font-bold mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="mensal">
        <TabsList>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="consolidado">Consolidado</TabsTrigger>
          <TabsTrigger value="anual">Anualizado</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal">
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10">Mês</TableHead>
                    <TableHead>Rec. Bruta</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Churn R$</TableHead>
                    <TableHead>Deduções</TableHead>
                    <TableHead>Rec. Líquida</TableHead>
                    <TableHead>Lucro Bruto</TableHead>
                    <TableHead>EBITDA</TableHead>
                    <TableHead>Res. Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.map(p => (
                    <TableRow key={p.month}>
                      <TableCell className="sticky left-0 bg-card z-10 font-medium">{p.month}</TableCell>
                      <TableCell>{formatCurrency(p.receitaBrutaTotal)}</TableCell>
                      <TableCell>{formatCurrency(p.mrrFinal)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(p.churnValor)}</TableCell>
                      <TableCell>{formatCurrency(p.deducoes)}</TableCell>
                      <TableCell>{formatCurrency(p.receitaLiquida)}</TableCell>
                      <TableCell>{formatCurrency(p.lucroBruto)}</TableCell>
                      <TableCell>{formatCurrency(p.ebitda)}</TableCell>
                      <TableCell className={p.resultadoFinal < 0 ? 'text-destructive' : 'text-primary'}>{formatCurrency(p.resultadoFinal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidado">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Receita Bruta Total', val: total('receitaBrutaTotal') },
                  { label: 'Receita Líquida', val: total('receitaLiquida') },
                  { label: 'Custos Variáveis', val: total('custosVariaveisTotal') },
                  { label: 'Lucro Bruto', val: total('lucroBruto') },
                  { label: 'Despesas Fixas', val: total('despFixasTotal') },
                  { label: 'EBITDA', val: total('ebitda') },
                  { label: 'Resultado Líquido', val: total('resultadoLiquido') },
                  { label: 'Resultado Final', val: total('resultadoFinal') },
                ].map(item => (
                  <div key={item.label} className="flex justify-between p-3 rounded-lg bg-muted">
                    <span>{item.label}</span>
                    <span className={`font-bold ${item.val < 0 ? 'text-destructive' : ''}`}>{formatCurrency(item.val)}</span>
                  </div>
                ))}
                <div className="flex justify-between p-3 rounded-lg bg-muted">
                  <span>Média Mensal (Resultado Final)</span>
                  <span className="font-bold">{formatCurrency(total('resultadoFinal') / projections.length)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anual">
          <Card>
            <CardContent className="pt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Rec. Bruta</TableHead>
                    <TableHead>Rec. Líquida</TableHead>
                    <TableHead>EBITDA</TableHead>
                    <TableHead>Res. Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: Math.ceil(projections.length / 12) }, (_, y) => {
                    const yearData = projections.slice(y * 12, (y + 1) * 12);
                    const sum = (k: keyof MonthlyProjection) => yearData.reduce((s, p) => s + (p[k] as number), 0);
                    return (
                      <TableRow key={y}>
                        <TableCell className="font-medium">Ano {y + 1}</TableCell>
                        <TableCell>{formatCurrency(sum('receitaBrutaTotal'))}</TableCell>
                        <TableCell>{formatCurrency(sum('receitaLiquida'))}</TableCell>
                        <TableCell>{formatCurrency(sum('ebitda'))}</TableCell>
                        <TableCell className={sum('resultadoFinal') < 0 ? 'text-destructive' : 'text-primary'}>
                          {formatCurrency(sum('resultadoFinal'))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
