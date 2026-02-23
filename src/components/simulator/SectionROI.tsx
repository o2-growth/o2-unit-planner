import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { InvestmentData, MonthlyProjection } from '@/types/simulator';
import { calculateROI } from '@/lib/financial';

interface Props {
  data: InvestmentData;
  onChange: (data: InvestmentData) => void;
  projections: MonthlyProjection[];
  metaROIMeses: number;
}

export function SectionROI({ data, onChange, projections, metaROIMeses }: Props) {
  const update = <K extends keyof InvestmentData>(key: K, value: number) =>
    onChange({ ...data, [key]: value });

  const { totalInvestimento, roiAnual, paybackMeses } = calculateROI(data, projections);
  const atingeMeta = paybackMeses > 0 && paybackMeses <= metaROIMeses;

  const fields: { key: keyof InvestmentData; label: string }[] = [
    { key: 'taxaFranquia', label: 'Taxa de Franquia' },
    { key: 'capitalGiro', label: 'Capital de Giro Inicial' },
    { key: 'implantacao', label: 'Implantação / Setup da Unidade' },
    { key: 'marketingInicial', label: 'Marketing Inicial' },
    { key: 'equipamentos', label: 'Equipamentos / Mobiliário' },
    { key: 'outros', label: 'Outros Investimentos' },
  ];

  return (
    <section>
      <SectionHeader number={11} title="ROI e Payback" description="Investimento inicial e retorno projetado" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-3">
            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-sm">{f.label}</Label>
                <CurrencyInput value={data[f.key]} onChange={v => update(f.key, v)} />
              </div>
            ))}
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-bold">Investimento Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalInvestimento)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={atingeMeta ? 'border-primary' : 'border-destructive'}>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              {atingeMeta ? (
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-2" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto text-destructive mb-2" />
              )}
              <p className={`text-lg font-bold ${atingeMeta ? 'text-primary' : 'text-destructive'}`}>
                {paybackMeses > 0
                  ? atingeMeta ? 'Atinge a meta de ROI/Payback!' : 'Não atinge a meta de ROI/Payback'
                  : 'Preencha os investimentos'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>ROI Anual</span>
                <span className="font-bold text-lg">{formatPercent(roiAnual)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payback Projetado</span>
                <span className="font-bold text-lg">{paybackMeses > 0 ? `${paybackMeses} meses` : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Meta do Franqueado</span>
                <span className="font-medium">{metaROIMeses} meses</span>
              </div>
              {paybackMeses > 0 && !atingeMeta && (
                <div className="flex justify-between text-destructive">
                  <span>Diferença</span>
                  <span className="font-medium">+{paybackMeses - metaROIMeses} meses</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
