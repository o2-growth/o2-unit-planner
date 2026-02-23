import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from './SectionHeader';

const OPTIONS = [
  { value: 12, label: '12 meses', tag: 'Curto prazo' },
  { value: 18, label: '18 meses', tag: 'Curto prazo' },
  { value: 24, label: '24 meses', tag: 'Médio prazo' },
  { value: 36, label: '36 meses', tag: 'Médio prazo' },
  { value: 48, label: '48 meses', tag: 'Longo prazo' },
  { value: 60, label: '60 meses', tag: 'Longo prazo (5 anos)' },
];

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function SectionHorizon({ value, onChange }: Props) {
  return (
    <section>
      <SectionHeader number={4} title="Horizonte de Projeção" description="Selecione o período para a modelagem financeira" />
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={`relative p-4 rounded-lg border-2 text-left transition-all ${
                  value === opt.value
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-bold text-lg">{opt.label}</div>
                <Badge variant="secondary" className="mt-1 text-xs">{opt.tag}</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
