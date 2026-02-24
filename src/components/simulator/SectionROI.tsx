import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { CheckCircle2, XCircle, Tag, AlertCircle } from 'lucide-react';
import type { InvestmentData, MonthlyProjection } from '@/types/simulator';
import { calculateROI } from '@/lib/financial';

interface Props {
  data: InvestmentData;
  onChange: (data: InvestmentData) => void;
  projections: MonthlyProjection[];
  metaROIMeses: number;
}

const CUPOM_VALIDO = 'FRANQUIAOURO';

export function SectionROI({ data, onChange, projections, metaROIMeses }: Props) {
  const [cupomInput, setCupomInput] = useState(data.cupom || '');
  const [cupomFeedback, setCupomFeedback] = useState<'valid' | 'invalid' | null>(data.cupomAplicado ? 'valid' : null);

  const update = <K extends keyof InvestmentData>(key: K, value: InvestmentData[K]) =>
    onChange({ ...data, [key]: value });

  const handleAplicarCupom = () => {
    const isValid = cupomInput.trim().toUpperCase() === CUPOM_VALIDO;
    setCupomFeedback(isValid ? 'valid' : 'invalid');
    onChange({
      ...data,
      cupom: cupomInput.trim().toUpperCase(),
      cupomAplicado: isValid,
      taxaFranquia: isValid ? 140000 : 190000,
    });
  };

  const { totalInvestimento, roiAnual, paybackMeses, taxaFinal } = calculateROI(data, projections);
  const atingeMeta = paybackMeses > 0 && paybackMeses <= metaROIMeses;

  const fields: { key: keyof InvestmentData; label: string }[] = [
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
            {/* Taxa de franquia */}
            <div className="p-3 rounded-lg border border-primary/20 bg-accent/30">
              <Label className="text-sm font-semibold">Taxa de Franquia</Label>
              <div className="flex items-center justify-between mt-1">
                <span className="text-lg font-bold">{formatCurrency(taxaFinal)}</span>
                {data.cupomAplicado && (
                  <span className="text-xs text-primary line-through">{formatCurrency(190000)}</span>
                )}
              </div>
              {data.cupomAplicado && (
                <p className="text-xs text-primary mt-1">Desconto aplicado: {formatCurrency(50000)}</p>
              )}
            </div>

            {/* Cupom */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-xs">Cupom de desconto</Label>
                <Input
                  value={cupomInput}
                  onChange={e => setCupomInput(e.target.value)}
                  placeholder="Digite o cupom"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAplicarCupom} variant="outline" size="sm" className="gap-1">
                <Tag className="w-3 h-3" /> Aplicar
              </Button>
            </div>
            {cupomFeedback === 'valid' && (
              <div className="flex items-center gap-1 text-primary text-xs"><CheckCircle2 className="w-4 h-4" /> Cupom válido! Taxa ajustada para {formatCurrency(140000)}.</div>
            )}
            {cupomFeedback === 'invalid' && (
              <div className="flex items-center gap-1 text-destructive text-xs"><AlertCircle className="w-4 h-4" /> Cupom inválido. Taxa mantida em {formatCurrency(190000)}.</div>
            )}

            {fields.map(f => (
              <div key={f.key}>
                <Label className="text-sm">{f.label}</Label>
                <CurrencyInput value={data[f.key] as number} onChange={v => update(f.key, v)} />
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
