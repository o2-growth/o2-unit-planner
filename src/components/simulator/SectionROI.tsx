import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { CheckCircle2, XCircle, Tag, AlertCircle, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { InvestmentData, MonthlyProjection } from '@/types/simulator';
import { calculateROI } from '@/lib/financial';

interface Props {
  data: InvestmentData;
  onChange: (data: InvestmentData) => void;
  projections: MonthlyProjection[];
  metaROIMeses: number;
}

const CUPOM_VALIDO = 'FRANQUIAOURO';

const TOOLTIPS: Record<string, string> = {
  implantacao: 'Reforma, pintura, manutenção do espaço físico.',
  marketingInicial: 'Patrocinar eventos na região, fazer um coquetel de lançamento convidando clientes, prospects e parceiros.',
  equipamentos: 'Mesa, cadeira, televisão, computadores, wifi, etc.',
  outros: 'Vinho, brinde, lojinha O2 Inc., etc.',
};

function FieldWithTooltip({ label, tooltip, children }: { label: string; tooltip: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1">
        <Label className="text-sm">{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-muted-foreground hover:text-primary">
              <HelpCircle className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="text-sm max-w-xs">{tooltip}</PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  );
}

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

  const { totalInvestimento, capitalGiro, roiDireto, roiTotal, paybackMeses, taxaFinal } = calculateROI(data, projections);
  const resultadoAnual = projections.slice(0, 12).reduce((sum, p) => sum + p.resultadoFinal, 0);
  const atingeMeta = paybackMeses > 0 && paybackMeses <= metaROIMeses;
  const investimentoPreenchido = data.taxaFranquia > 0;

  return (
    <section>
      <SectionHeader number={10} title="ROI e Payback" description="Investimento inicial e retorno projetado" />
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

            {/* Investment fields with tooltips */}
            <FieldWithTooltip label="Implantação / Setup da Unidade" tooltip={TOOLTIPS.implantacao}>
              <CurrencyInput value={data.implantacao} onChange={v => update('implantacao', v)} />
            </FieldWithTooltip>

            <FieldWithTooltip label="Marketing Inicial" tooltip={TOOLTIPS.marketingInicial}>
              <CurrencyInput value={data.marketingInicial} onChange={v => update('marketingInicial', v)} />
            </FieldWithTooltip>

            <FieldWithTooltip label="Equipamentos / Mobiliário" tooltip={TOOLTIPS.equipamentos}>
              <CurrencyInput value={data.equipamentos} onChange={v => update('equipamentos', v)} />
            </FieldWithTooltip>

            <FieldWithTooltip label="Outros Investimentos" tooltip={TOOLTIPS.outros}>
              <CurrencyInput value={data.outros} onChange={v => update('outros', v)} />
            </FieldWithTooltip>

            {/* Capital de giro (calculado) */}
            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Prejuízo meses iniciais</span>
                <span className="font-medium text-destructive">
                  {formatCurrency(capitalGiro - data.implantacao - data.marketingInicial - data.equipamentos - data.outros)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Capital de Giro Sugerido</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary"><HelpCircle className="w-4 h-4" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="text-sm max-w-xs">
                      Capital de giro = prejuízo acumulado dos primeiros meses + implantação + marketing inicial + equipamentos + outros investimentos.
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="text-lg font-bold">{formatCurrency(capitalGiro)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-bold text-lg">Investimento Total</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(totalInvestimento)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results card */}
        <Card className={atingeMeta ? 'border-primary' : 'border-destructive'}>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center">
              {atingeMeta ? (
                <CheckCircle2 className="w-16 h-16 mx-auto text-primary mb-2" />
              ) : (
                <XCircle className="w-16 h-16 mx-auto text-destructive mb-2" />
              )}
              <p className={`text-lg font-bold ${atingeMeta ? 'text-primary' : 'text-destructive'}`}>
                {!investimentoPreenchido
                  ? 'Preencha os investimentos'
                  : paybackMeses === -1
                    ? 'Payback excede o horizonte'
                    : atingeMeta
                      ? 'Atinge a meta de ROI/Payback!'
                      : 'Não atinge a meta de ROI/Payback'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>Payback Projetado</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary"><HelpCircle className="w-3 h-3" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="text-sm max-w-xs">
                      Tempo estimado para recuperar o investimento total com base no resultado mensal projetado.
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="font-bold text-lg">{paybackMeses > 0 ? `${paybackMeses.toFixed(2)} meses` : '—'}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>ROI Direto</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary"><HelpCircle className="w-3 h-3" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="text-xs max-w-xs space-y-2">
                      <p className="font-semibold">Fórmula: Resultado Anual (12m) ÷ Taxa de Franquia × 100</p>
                      <div className="border-t pt-1 space-y-1">
                        <div className="flex justify-between"><span>Resultado Anual (12m):</span><span className="font-medium">{formatCurrency(resultadoAnual)}</span></div>
                        <div className="flex justify-between"><span>Taxa de Franquia:</span><span className="font-medium">{formatCurrency(taxaFinal)}</span></div>
                      </div>
                      <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>= ROI Direto:</span><span>{formatPercent(roiDireto)}</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="font-bold text-lg">{formatPercent(roiDireto)}</span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>ROI Total</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="text-muted-foreground hover:text-primary"><HelpCircle className="w-3 h-3" /></button>
                    </PopoverTrigger>
                    <PopoverContent className="text-xs max-w-xs space-y-2">
                      <p className="font-semibold">Fórmula: Resultado Anual (12m) ÷ Investimento Total × 100</p>
                      <div className="border-t pt-1 space-y-1">
                        <div className="flex justify-between"><span>Resultado Anual (12m):</span><span className="font-medium">{formatCurrency(resultadoAnual)}</span></div>
                        <div className="flex justify-between"><span>Taxa de Franquia:</span><span className="font-medium">{formatCurrency(taxaFinal)}</span></div>
                        <div className="flex justify-between"><span>Capital de Giro:</span><span className="font-medium">{formatCurrency(capitalGiro)}</span></div>
                        <div className="flex justify-between"><span>Investimento Total:</span><span className="font-medium">{formatCurrency(totalInvestimento)}</span></div>
                      </div>
                      <div className="border-t pt-1 flex justify-between font-semibold">
                        <span>= ROI Total:</span><span>{formatPercent(roiTotal)}</span>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="font-bold text-lg">{formatPercent(roiTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Meta do Franqueado</span>
                <span className="font-medium">{metaROIMeses} meses</span>
              </div>
              {paybackMeses > 0 && !atingeMeta && (
                <div className="flex justify-between text-destructive">
                  <span>Diferença</span>
                  <span className="font-medium">+{(paybackMeses - metaROIMeses).toFixed(2)} meses</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
