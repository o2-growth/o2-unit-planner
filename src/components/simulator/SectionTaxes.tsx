import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { Info, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';
import type { TaxesData, BUTaxConfig, TipoReceita, AnexoSimples, MonthlyProjection, ProfileData, SociosConfig } from '@/types/simulator';
import { calcAliquotaEfetiva, sugerirAnexo, getFaixaLabel, excedeSimples } from '@/lib/simplesNacional';
import { formatCurrencyCompact, formatCurrency } from '@/lib/formatters';

const TIPO_RECEITA_LABELS: Record<TipoReceita, string> = {
  servico: 'Serviço',
  revenda_mercadoria: 'Revenda / Mercadoria',
  royalties_licenciamento: 'Royalties / Licenciamento',
  material_didatico: 'Material Didático',
  software_assinatura: 'Software / Assinatura',
  outro: 'Outro',
};

function getBasePresumida(tipoReceita: string): { irpj: number; csll: number } {
  switch (tipoReceita) {
    case 'revenda_mercadoria':
    case 'material_didatico':
      return { irpj: 0.08, csll: 0.12 };
    default:
      return { irpj: 0.32, csll: 0.32 };
  }
}

interface Props {
  data: TaxesData;
  onChange: (data: TaxesData) => void;
  projections?: MonthlyProjection[];
  profileData?: ProfileData;
  sociosData?: SociosConfig;
}

export function SectionTaxes({ data, onChange, projections, profileData, sociosData }: Props) {
  const { isAdmin } = useAuth();
  const [resultOpen, setResultOpen] = useState(false);
  const [pendingRegime, setPendingRegime] = useState<string | null>(null);

  const regime = data.regime || 'lucro_presumido';
  const bus = data.bus || [];
  const simples = data.simples || { rbt12: 0, folha12m: 0, fatorR: 0, anexo: 'III' as const };

  // Auto-calculate faturamento per BU from projections (last month)
  const autoFat = useMemo(() => {
    if (!projections || projections.length === 0) return { caas: 0, saas: 0, setup: 0 };
    const last = projections[projections.length - 1];
    return {
      caas: last.receitaBrutaCaas,
      saas: last.receitaSaasOxyGenio,
      setup: last.receitaSetupTotal,
    };
  }, [projections]);

  const buFatMap: Record<string, number> = {
    caas: autoFat.caas,
    saas: autoFat.saas,
    setup: autoFat.setup,
  };

  const getBUFat = (buKey: string) => buFatMap[buKey] ?? 0;

  // Auto-calculate Folha de Pagamento: (pró-labore sócios + custo funcionários) × 12
  const folhaAutoCalculada = useMemo(() => {
    const proLaboreSocios = (sociosData?.socios || [])
      .slice(0, sociosData?.quantidade || 1)
      .reduce((sum, s) => sum + s.proLabore, 0);
    const custoFunc = profileData?.custoFuncionarios || 0;
    return (proLaboreSocios + custoFunc) * 12;
  }, [sociosData, profileData]);

  // RBT12 sugerido: receita bruta mês 1 × 12
  const rbt12Sugerido = useMemo(() => {
    if (!projections || projections.length === 0) return 0;
    return projections[0].receitaBrutaTotal * 12;
  }, [projections]);

  const rbt12Efetivo = simples.rbt12 || rbt12Sugerido;
  const fatorR = rbt12Efetivo > 0 ? folhaAutoCalculada / rbt12Efetivo : 0;
  const faturamentoTotal = bus.reduce((s, b) => s + getBUFat(b.buKey), 0);
  const faturamentoAnual = faturamentoTotal * 12;

  // Confidence indicator
  const confidence = useMemo(() => {
    let score = 0;
    let total = 0;
    for (const bu of bus) {
      if (getBUFat(bu.buKey) > 0) {
        total++;
        let buScore = 0;
        if (bu.cnae) buScore++;
        if (bu.tipoReceita) buScore++;
        if (regime === 'lucro_presumido' && bu.aliquotaIss > 0) buScore++;
        if (regime === 'simples_nacional') buScore++; // ISS included in DAS
        score += buScore;
      }
    }
    if (regime === 'simples_nacional' && simples.rbt12 > 0) score += 2;
    const maxScore = total * 3 + (regime === 'simples_nacional' ? 2 : 0);
    if (maxScore === 0) return 'baixo';
    const pct = score / maxScore;
    if (pct >= 0.8) return 'alto';
    if (pct >= 0.5) return 'medio';
    return 'baixo';
  }, [bus, regime, simples.rbt12]);

  const updateBU = (idx: number, partial: Partial<BUTaxConfig>) => {
    const newBus = [...bus];
    newBus[idx] = { ...newBus[idx], ...partial };
    onChange({ ...data, bus: newBus });
  };

  return (
    <section>
      <SectionHeader
        number={7}
        title="Impostos / Deduções"
        description="Configure regime, faturamento por BU e tributação específica."
      />

      {/* Regime Tributário */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Regime Tributário</h4>
          <div className="flex gap-2">
            <Button
              variant={regime === 'lucro_presumido' ? 'default' : 'outline'}
              className={regime === 'lucro_presumido' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => {
                if (regime !== 'lucro_presumido') setPendingRegime('lucro_presumido');
              }}
            >
              Lucro Presumido
            </Button>
            <Button
              variant={regime === 'simples_nacional' ? 'default' : 'outline'}
              className={regime === 'simples_nacional' ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => {
                if (regime !== 'simples_nacional') setPendingRegime('simples_nacional');
              }}
            >
              Simples Nacional
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AlertDialog de confirmação de troca de regime */}
      <AlertDialog open={pendingRegime !== null} onOpenChange={open => { if (!open) setPendingRegime(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Regime Tributário</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja alterar o regime para {pendingRegime === 'lucro_presumido' ? 'Lucro Presumido' : 'Simples Nacional'}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (pendingRegime) onChange({ ...data, regime: pendingRegime as TaxesData['regime'] });
              setPendingRegime(null);
            }}>Sim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Simples Nacional params */}
      {regime === 'simples_nacional' && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-3">Parâmetros do Simples Nacional</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">RBT12 (Receita Bruta 12 meses)</label>
                <CurrencyInput
                  value={simples.rbt12 || rbt12Sugerido}
                  onChange={v => onChange({ ...data, simples: { ...simples, rbt12: v } })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sugerido: {formatCurrencyCompact(rbt12Sugerido)} (mês 1 DRE × 12). Você pode alterar com o respectivo valor do campo RBT12 do seu extrato atual do Simples Nacional.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Folha de Pagamento 12 meses</label>
                <div className="py-2 px-3 bg-muted rounded-md text-sm font-medium">
                  {formatCurrencyCompact(folhaAutoCalculada)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado automaticamente: (pró-labore dos sócios + custo funcionários) × 12 meses
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <Badge variant={fatorR >= 0.28 ? 'default' : 'destructive'}>
                Fator R: {((folhaAutoCalculada / ((simples.rbt12 || rbt12Sugerido) || 1)) * 100).toFixed(1)}%
              </Badge>
              <Badge variant="secondary">
                Anexo sugerido: {sugerirAnexo(folhaAutoCalculada / ((simples.rbt12 || rbt12Sugerido) || 1))}
              </Badge>
              <Badge variant="secondary">
                Fat. mensal (BUs): {formatCurrencyCompact(faturamentoTotal)}
              </Badge>
              <Badge variant="secondary">
                Fat. anual (BUs): {formatCurrencyCompact(faturamentoAnual)}
              </Badge>
            </div>

            {fatorR >= 0.28 && (
              <div className="mt-2 flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Fator R ≥ 28% — enquadramento no Anexo III (alíquotas menores, a partir de 6%)
              </div>
            )}
            {excedeSimples(simples.rbt12 || rbt12Sugerido) && (
              <div className="mt-3 flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" />
                RBT12 excede o limite de R$ 4.800.000 do Simples Nacional
              </div>
            )}
            {fatorR > 0 && fatorR < 0.28 && (
              <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Fator R abaixo de 28% — BUs não sujeitas ao Fator R serão tributadas pelo Anexo V (alíquotas maiores, a partir de 15,5%)
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabela de BUs */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-3">Faturamento e Configuração por BU</h4>
          <p className="text-xs text-muted-foreground mb-3">Faturamento calculado automaticamente pelo modelo (mês 12, último mês projetado DRE)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-2">BU</th>
                  <th className="text-center py-2 px-2">Faturamento/mês</th>
                  <th className="text-center py-2 px-2">Tipo Receita</th>
                  {regime === 'lucro_presumido' && (
                    <>
                      <th className="text-center py-2 px-2">ISS %</th>
                      <th className="text-center py-2 px-2">ISS (R$)</th>
                    </>
                  )}
                  {regime === 'simples_nacional' && (
                    <>
                      <th className="text-center py-2 px-2">Anexo</th>
                      <th className="text-center py-2 px-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 mx-auto">
                              Fator R?
                              <Info className="w-3 h-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Se marcado, o anexo será determinado automaticamente pelo Fator R global
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {bus.map((bu, idx) => {
                  const anexoEfetivo = bu.sujeitoFatorR ? sugerirAnexo(fatorR) : bu.anexoSimples;
                  return (
                    <tr key={bu.buKey} className="border-b">
                      <td className="py-2 pr-2 font-medium">{bu.buNome}</td>
                      <td className="py-2 px-2 text-center text-sm font-medium text-muted-foreground">
                        {formatCurrencyCompact(getBUFat(bu.buKey))}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex justify-center">
                          <Select
                            value={bu.tipoReceita}
                            onValueChange={v => updateBU(idx, { tipoReceita: v as TipoReceita })}
                            disabled={!isAdmin}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TIPO_RECEITA_LABELS).map(([k, label]) => (
                              <SelectItem key={k} value={k}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        </div>
                        {bu.tipoReceita === 'software_assinatura' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground mt-1" />
                              </TooltipTrigger>
                              <TooltipContent>
                                Software/SaaS pode ter regime especial de ISS dependendo do município
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                      {regime === 'lucro_presumido' && (
                        <>
                          <td className="py-2 px-2">
                            <Input
                              type="number" min={2} max={5} step={0.5}
                              value={bu.aliquotaIss}
                              onChange={e => {
                                const val = parseFloat(e.target.value);
                                if (isNaN(val)) return;
                                const clamped = Math.min(5, Math.max(2, val));
                                updateBU(idx, { aliquotaIss: clamped });
                              }}
                              disabled={false}
                              className="w-16 h-8 text-xs text-center"
                            />
                          </td>
                          <td className="py-2 px-2 text-center text-sm font-medium text-muted-foreground">
                            {formatCurrencyCompact(getBUFat(bu.buKey) * (bu.aliquotaIss / 100))}
                          </td>
                        </>
                      )}
                      {regime === 'simples_nacional' && (
                        <>
                          <td className="py-2 px-2 text-center">
                            <div className="flex justify-center">
                              {bu.sujeitoFatorR ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs cursor-help">
                                        {anexoEfetivo} <span className="text-muted-foreground ml-1">(FR)</span>
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      Anexo definido pelo Fator R (relação folha/receita). Fator R ≥ 28% → Anexo III, senão Anexo V.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <Select
                                  value={bu.anexoSimples}
                                  onValueChange={v => updateBU(idx, { anexoSimples: v as AnexoSimples })}
                                  disabled={!isAdmin}
                                >
                                  <SelectTrigger className="w-20 h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="III">III</SelectItem>
                                    <SelectItem value="IV">IV</SelectItem>
                                    <SelectItem value="V">V</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={bu.sujeitoFatorR}
                              onChange={e => updateBU(idx, { sujeitoFatorR: e.target.checked })}
                              disabled={!isAdmin}
                              className="h-4 w-4"
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-2 pr-2">Total</td>
                  <td className="py-2 px-2 text-center">{formatCurrencyCompact(faturamentoTotal)}</td>
                  {regime === 'lucro_presumido' ? (
                    <>
                      <td></td>
                      <td></td>
                      <td className="py-2 px-2 text-center">
                        {formatCurrencyCompact(bus.reduce((sum, bu) => sum + getBUFat(bu.buKey) * (bu.aliquotaIss / 100), 0))}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3}></td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resultado Calculado (collapsible) */}
      <Collapsible open={resultOpen} onOpenChange={setResultOpen}>
        <Card>
          <CardContent className="pt-6">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h4 className="font-semibold">Resultado Tributário Calculado</h4>
              {resultOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              {regime === 'lucro_presumido' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-2">BU</th>
                        <th className="text-center py-2 px-1">PIS %</th>
                        <th className="text-center py-2 px-1">COFINS %</th>
                        <th className="text-center py-2 px-1">IRPJ %</th>
                        <th className="text-center py-2 px-1">CSLL %</th>
                        <th className="text-center py-2 px-1">ISS %</th>
                        <th className="text-center py-2 px-1">Total %</th>
                        <th className="text-center py-2 px-1">Total R$</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.filter(b => getBUFat(b.buKey) > 0).map(bu => {
                        const fat = getBUFat(bu.buKey);
                        const base = getBasePresumida(bu.tipoReceita);
                        const pis = 0.65;
                        const cofins = 3;
                        const irpj = base.irpj * 15 * 100; // e.g. 0.32 * 15 = 4.8%
                        const csll = base.csll * 9 * 100; // e.g. 0.32 * 9 = 2.88%
                        const iss = bu.aliquotaIss;
                        const total = pis + cofins + (base.irpj * 15 * 100) / 100 + (base.csll * 9 * 100) / 100 + iss;
                        const irpjPct = base.irpj * 0.15 * 100;
                        const csllPct = base.csll * 0.09 * 100;
                        const totalPct = pis + cofins + irpjPct + csllPct + iss;
                        const totalR = fat * (totalPct / 100);
                        return (
                          <tr key={bu.buKey} className="border-b">
                            <td className="py-2 pr-2 font-medium">{bu.buNome}</td>
                            <td className="text-center py-2 px-1">{pis.toFixed(2)}</td>
                            <td className="text-center py-2 px-1">{cofins.toFixed(2)}</td>
                            <td className="text-center py-2 px-1">{irpjPct.toFixed(2)}</td>
                            <td className="text-center py-2 px-1">{csllPct.toFixed(2)}</td>
                            <td className="text-center py-2 px-1">{iss.toFixed(2)}</td>
                            <td className="text-center py-2 px-1 font-semibold">{totalPct.toFixed(2)}</td>
                            <td className="text-center py-2 px-1 font-semibold">{formatCurrency(totalR)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-2">BU</th>
                        <th className="text-center py-2 px-1">Anexo</th>
                        <th className="text-center py-2 px-1">Faixa</th>
                        <th className="text-center py-2 px-1">Alíq. Efetiva %</th>
                        <th className="text-center py-2 px-1">DAS R$</th>
                        <th className="text-center py-2 px-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.filter(b => getBUFat(b.buKey) > 0).map(bu => {
                        const anexoEfetivo = bu.sujeitoFatorR ? sugerirAnexo(fatorR) : bu.anexoSimples;
                        const aliq = calcAliquotaEfetiva(rbt12Efetivo, anexoEfetivo);
                        const das = getBUFat(bu.buKey) * (aliq / 100);
                        return (
                          <tr key={bu.buKey} className="border-b">
                            <td className="py-2 pr-2 font-medium">{bu.buNome}</td>
                            <td className="text-center py-2 px-1">{anexoEfetivo}</td>
                            <td className="text-center py-2 px-1">{getFaixaLabel(rbt12Efetivo, anexoEfetivo)}</td>
                            <td className="text-center py-2 px-1">{aliq.toFixed(2)}%</td>
                            <td className="text-center py-2 px-1 font-semibold">{formatCurrency(das)}</td>
                            <td className="text-center py-2 px-1">
                              {bu.sujeitoFatorR && (
                                <Badge variant="outline" className="text-xs">FR</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-semibold">
                        <td className="py-2 pr-2">Total</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="text-center py-2 px-1">
                          {formatCurrency(
                            bus.filter(b => getBUFat(b.buKey) > 0).reduce((sum, bu) => {
                              const anexoEfetivo = bu.sujeitoFatorR ? sugerirAnexo(fatorR) : bu.anexoSimples;
                              const aliq = calcAliquotaEfetiva(rbt12Efetivo, anexoEfetivo);
                              return sum + getBUFat(bu.buKey) * (aliq / 100);
                            }, 0)
                          )}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>

      {/* Confidence indicator */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        {confidence === 'alto' && <><CheckCircle className="w-4 h-4 text-primary" /> <span className="text-primary font-medium">Confiança Alta</span></>}
        {confidence === 'medio' && <><AlertCircle className="w-4 h-4 text-amber-500" /> <span className="text-amber-600 font-medium">Confiança Média</span> <span className="text-muted-foreground">— preencha CNAE e tipo de receita</span></>}
        {confidence === 'baixo' && <><AlertTriangle className="w-4 h-4 text-destructive" /> <span className="text-destructive font-medium">Confiança Baixa</span> <span className="text-muted-foreground">— configure faturamento e dados das BUs</span></>}
      </div>
    </section>
  );
}
