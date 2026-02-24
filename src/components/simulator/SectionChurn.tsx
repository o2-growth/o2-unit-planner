import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SectionHeader } from './SectionHeader';

interface Props {
  churnMensal: number;
  onChangeChurn: (v: number) => void;
}

export function SectionChurn({ churnMensal, onChangeChurn }: Props) {
  return (
    <section>
      <SectionHeader
        number={6}
        title="Churn sobre MRR"
        tooltip="O churn incide sobre a base de MRR do mês anterior. O efeito aparece no DRE e nos resultados."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-xs">
            <Label>Churn mensal sobre MRR (%)</Label>
            <p className="text-xs text-muted-foreground mb-2">Percentual mensal de cancelamento aplicado sobre a base recorrente (MRR). O impacto será refletido no DRE e gráficos.</p>
            <Input
              type="number" min={0} max={100} step={0.1}
              value={churnMensal || ''}
              onChange={e => onChangeChurn(parseFloat(e.target.value) || 0)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
