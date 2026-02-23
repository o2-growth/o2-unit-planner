import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { Badge } from '@/components/ui/badge';
import type { GoalsData } from '@/types/simulator';

const ROI_OPTIONS = [12, 18, 24, 36, 48, 60];

interface Props {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
}

export function SectionGoals({ data, onChange }: Props) {
  const update = <K extends keyof GoalsData>(key: K, value: GoalsData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <section>
      <SectionHeader number={3} title="Objetivos do Franqueado" description="Defina suas metas financeiras" />
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label>Quanto você quer estar faturando após 12 meses? (R$/mês)</Label>
            <CurrencyInput value={data.faturamento12m} onChange={v => update('faturamento12m', v)} />
          </div>
          <div>
            <Label>Quanto você quer receber de pró-labore a partir de agora? (R$/mês)</Label>
            <CurrencyInput value={data.proLaboreDesejado} onChange={v => update('proLaboreDesejado', v)} />
          </div>
          <div>
            <Label>Quanto você quer receber de pró-labore daqui 12 meses? (R$/mês)</Label>
            <CurrencyInput value={data.proLabore12m} onChange={v => update('proLabore12m', v)} />
          </div>
          <div>
            <Label>Você quer ter ROI do seu investimento em quanto tempo?</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ROI_OPTIONS.map(m => (
                <Badge
                  key={m}
                  variant={data.metaROIMeses === m ? 'default' : 'outline'}
                  className="cursor-pointer text-sm px-4 py-2"
                  onClick={() => update('metaROIMeses', m)}
                >
                  {m} meses
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
