import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SectionHeader } from './SectionHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { MonthlyProjection } from '@/types/simulator';

interface Props {
  churnMensal: number;
  onChangeChurn: (v: number) => void;
  projections: MonthlyProjection[];
}

export function SectionChurn({ churnMensal, onChangeChurn, projections }: Props) {
  return (
    <section>
      <SectionHeader
        number={7}
        title="Churn sobre MRR"
        tooltip="O churn incide sobre a base de MRR do mês anterior. Base MRR final = Base inicial - Churn + Novo MRR."
      />
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="max-w-xs">
            <Label>Churn mensal sobre MRR (%)</Label>
            <Input
              type="number" min={0} max={100} step={0.1}
              value={churnMensal || ''}
              onChange={e => onChangeChurn(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>

          {projections.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Base MRR Inicial</TableHead>
                    <TableHead>Churn (%)</TableHead>
                    <TableHead>Churn (R$)</TableHead>
                    <TableHead>Novo MRR</TableHead>
                    <TableHead>Base MRR Final</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projections.slice(0, 12).map(p => (
                    <TableRow key={p.month}>
                      <TableCell className="font-medium">{p.month}</TableCell>
                      <TableCell>{formatCurrency(p.mrrInicial)}</TableCell>
                      <TableCell>{formatPercent(churnMensal)}</TableCell>
                      <TableCell className="text-destructive">{formatCurrency(p.churnValor)}</TableCell>
                      <TableCell className="text-primary">{formatCurrency(p.novoMrr)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(p.mrrFinal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
