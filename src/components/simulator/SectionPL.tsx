import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from './SectionHeader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CurrencyInput } from './CurrencyInput';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { ChevronRight, Info } from 'lucide-react';
import type { MonthlyProjection, CostLine, GoalsData } from '@/types/simulator';

type BelowEbitdaData = {
  recFinanceiras: number;
  despFinanceiras: number;
  amortizacao: number;
  investimentosMensal: number;
};

interface Props {
  projections: MonthlyProjection[];
  fixedCosts: CostLine[];
  variableCostRates: CostLine[];
  belowEbitda: BelowEbitdaData;
  goals: GoalsData;
  onFixedCostsChange: (costs: CostLine[]) => void;
  onVariableCostsChange: (costs: CostLine[]) => void;
  onBelowEbitdaChange: (data: BelowEbitdaData) => void;
}

export function SectionPL({ projections, fixedCosts, variableCostRates, belowEbitda, goals, onFixedCostsChange, onVariableCostsChange, onBelowEbitdaChange }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    receita: false,
    deducoes: false,
    custos: false,
    despesas: false,
    abaixo: false,
  });

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const updateVariable = (idx: number, val: number) => {
    const n = [...variableCostRates];
    n[idx] = { ...n[idx], percentual: val };
    onVariableCostsChange(n);
  };
  const updateFixed = (idx: number, val: number) => {
    const n = [...fixedCosts];
    n[idx] = { ...n[idx], percentual: val };
    onFixedCostsChange(n);
  };

  return (
    <section>
      <SectionHeader number={10} title="Premissas do DRE Gerencial" description="Custos e despesas em % sobre receita" />

      {/* Cost inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardContent className="pt-4">
            <Label className="text-base font-semibold mb-3 block">Custos Variáveis (%)</Label>
            {variableCostRates.map((c, i) => (
              <div key={c.key} className="mb-2 flex items-center gap-2">
                <Label className="text-xs flex-1">{c.nome}</Label>
                <div className="w-24 flex items-center gap-1">
                  <Input
                    type="number" min={0} max={100} step={0.5}
                    value={c.percentual}
                    onChange={e => updateVariable(i, parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs text-right"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>CS será 2% automaticamente quando receita &gt; R$ 500k/mês</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Label className="text-base font-semibold mb-3 block">Despesas Fixas (%)</Label>
            {fixedCosts.map((c, i) => (
              <div key={c.key} className="mb-2 flex items-center gap-2">
                <Label className="text-xs flex-1">{c.nome}</Label>
                <div className="w-24 flex items-center gap-1">
                  <Input
                    type="number" min={0} max={100} step={0.5}
                    value={c.percentual}
                    onChange={e => updateFixed(i, parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs text-right"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            ))}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Label className="flex-1">Pessoal (pró-labore)</Label>
                <span className="text-xs font-medium text-primary">
                  {formatCurrency(goals.proLaboreDesejado)} → {formatCurrency(goals.proLabore12m)} (13°+)
                </span>
              </div>
              <div className="flex items-start gap-1 text-xs text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5 shrink-0" />
                <span>Admin: R$ 6.000 fixo até 100k de receita, depois aplica o % acima</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Below EBITDA */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <Label className="text-base font-semibold mb-3 block">Ajustes Abaixo do EBITDA (R$/mês)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'recFinanceiras', label: 'Receitas Financeiras' },
              { key: 'despFinanceiras', label: 'Despesas Financeiras' },
              { key: 'amortizacao', label: 'Amortização da Dívida' },
              { key: 'investimentosMensal', label: 'Investimentos' },
            ].map(item => (
              <div key={item.key}>
                <Label className="text-xs">{item.label}</Label>
                <CurrencyInput
                  value={belowEbitda[item.key as keyof typeof belowEbitda]}
                  onChange={v => onBelowEbitdaChange({ ...belowEbitda, [item.key]: v })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DRE Table */}
      <Card>
        <CardContent className="pt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground">
                <TableHead className="text-primary-foreground font-bold sticky left-0 bg-primary z-10 min-w-[220px] w-[220px]">Linha</TableHead>
                {projections.map(p => (
                  <TableHead key={p.month} className="text-primary-foreground text-center min-w-[100px]">Mês {p.month}</TableHead>
                ))}
                <TableHead className="text-primary-foreground text-center min-w-[120px] bg-primary/80 font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* RECEITA BRUTA */}
              <GroupRow label="= RECEITA BRUTA" values={projections.map(p => p.receitaBrutaTotal)} expanded={expanded.receita} onToggle={() => toggle('receita')} highlight />
              {expanded.receita && (
                <>
                  <DRERow label="  CAAS" values={projections.map(p => p.receitaBrutaCaas)} />
                  <DRERow label="  SAAS + Setup" values={projections.map(p => p.receitaBrutaSaas)} />
                  <DRERow label="  Education" values={projections.map(p => p.receitaBrutaEducation)} />
                  <DRERow label="  Expansão / Diagnóstico" values={projections.map(p => p.receitaBrutaExpansao)} />
                  <DRERow label="  Tax" values={projections.map(p => p.receitaBrutaTax)} />
                  {projections[0]?.receitaPreExistente > 0 && (
                    <DRERow label="  Receita Pré-existente (M1)" values={projections.map(p => p.receitaPreExistente)} />
                  )}
                </>
              )}

              {/* DEDUÇÕES */}
              <GroupRow label="(-) Deduções de Vendas" values={projections.map(p => -p.deducoesTotal)} expanded={expanded.deducoes} onToggle={() => toggle('deducoes')} negative />
              {expanded.deducoes && (
                <>
                  <DRERow label="  PIS" values={projections.map(p => -p.deducaoPIS)} negative />
                  <DRERow label="  COFINS" values={projections.map(p => -p.deducaoCOFINS)} negative />
                  <DRERow label="  ISSQN" values={projections.map(p => -p.deducaoISSQN)} negative />
                  <DRERow label="  ICMS" values={projections.map(p => -p.deducaoICMS)} negative />
                </>
              )}

              <DRERow label="= RECEITA LÍQUIDA" values={projections.map(p => p.receitaLiquida)} highlight />

              {/* CUSTOS VARIÁVEIS */}
              <GroupRow label="(-) Custos Variáveis" values={projections.map(p => -p.custosVariaveisTotal)} expanded={expanded.custos} onToggle={() => toggle('custos')} negative />
              {expanded.custos && (
                <>
                  <DRERow label="  Custos CAAS (25%)" values={projections.map(p => -p.custosCaas)} negative />
                  <DRERow label="  Custos SAAS (0%)" values={projections.map(p => -p.custosSaas)} negative />
                  <DRERow label="  Custos Education" values={projections.map(p => -p.custosEducation)} negative />
                  <DRERow label="  Custos CS" values={projections.map(p => -p.custosCS)} negative />
                  <DRERow label="  Custos Expansão" values={projections.map(p => -p.custosExpansao)} negative />
                  <DRERow label="  Custos Tax" values={projections.map(p => -p.custosTax)} negative />
                  <DRERow label="  Royalties (20%)" values={projections.map(p => -p.royaltiesValor)} negative />
                  <DRERow label="  CAC Matriz" values={projections.map(p => -p.cacTotal)} negative />
                </>
              )}

              <DRERow label="= LUCRO BRUTO (Margem Contribuição)" values={projections.map(p => p.lucroBruto)} highlight />
              <DRERow label="  Margem Bruta" values={projections.map(p => p.margemBruta)} percent />

              {/* DESPESAS FIXAS */}
              <GroupRow label="(-) Despesas Fixas" values={projections.map(p => -p.despFixasTotal)} expanded={expanded.despesas} onToggle={() => toggle('despesas')} negative />
              {expanded.despesas && (
                <>
                  <DRERow label="  Marketing (7,5%)" values={projections.map(p => -p.despMarketing)} negative />
                  <DRERow label="  Comerciais (7,5%)" values={projections.map(p => -p.despComerciais)} negative />
                  <DRERow label="  Pessoal (pró-labore)" values={projections.map(p => -p.despPessoal)} negative />
                  <DRERow label="  Administrativas" values={projections.map(p => -p.despAdm)} negative />
                </>
              )}

              <DRERow label="= EBITDA" values={projections.map(p => p.ebitda)} highlight />
              <DRERow label="  Margem EBITDA" values={projections.map(p => p.margemEbitda)} percent />

              {/* ABAIXO DO EBITDA */}
              <GroupRow label="Abaixo do EBITDA" values={projections.map(p => p.recFinanceiras - p.despFinanceiras - p.irpjCsll)} expanded={expanded.abaixo} onToggle={() => toggle('abaixo')} />
              {expanded.abaixo && (
                <>
                  <DRERow label="  + Receitas Financeiras" values={projections.map(p => p.recFinanceiras)} />
                  <DRERow label="  - Despesas Financeiras" values={projections.map(p => -p.despFinanceiras)} negative />
                  <DRERow label="  - IRPJ/CSLL" values={projections.map(p => -p.irpjCsll)} negative />
                </>
              )}

              <DRERow label="= RESULTADO LÍQUIDO" values={projections.map(p => p.resultadoLiquido)} highlight />
              <DRERow label="(-) Amortização da Dívida" values={projections.map(p => -p.amortizacao)} negative />
              <DRERow label="(-) Investimentos" values={projections.map(p => -p.investimentos)} negative />
              <DRERow label="= RESULTADO FINAL" values={projections.map(p => p.resultadoFinal)} highlight primary />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function GroupRow({ label, values, expanded, onToggle, highlight, negative }: {
  label: string;
  values: number[];
  expanded: boolean;
  onToggle: () => void;
  highlight?: boolean;
  negative?: boolean;
}) {
  const total = values.reduce((s, v) => s + v, 0);
  return (
    <TableRow className={`cursor-pointer hover:bg-muted/50 ${highlight ? 'bg-muted font-semibold' : ''}`} onClick={onToggle}>
      <TableCell className={`sticky left-0 z-10 whitespace-nowrap min-w-[220px] w-[220px] ${highlight ? 'bg-muted' : 'bg-card'}`}>
        <span className="flex items-center gap-1">
          <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          {label}
        </span>
      </TableCell>
      {values.map((v, i) => (
        <TableCell key={i} className={`text-right ${v < 0 ? 'text-destructive' : ''}`}>
          {formatCurrency(Math.abs(v))}
        </TableCell>
      ))}
      <TableCell className={`text-right font-bold bg-primary/5 ${total < 0 ? 'text-destructive' : ''}`}>
        {formatCurrency(Math.abs(total))}
      </TableCell>
    </TableRow>
  );
}

function DRERow({ label, values, highlight, primary, negative, percent }: {
  label: string;
  values: number[];
  highlight?: boolean;
  primary?: boolean;
  negative?: boolean;
  percent?: boolean;
}) {
  const total = values.reduce((s, v) => s + v, 0);
  const displayTotal = percent ? total / (values.length || 1) : total;
  return (
    <TableRow className={highlight ? (primary ? 'bg-primary/10 font-bold' : 'bg-muted font-semibold') : ''}>
      <TableCell className={`sticky left-0 z-10 whitespace-nowrap min-w-[220px] w-[220px] ${highlight ? (primary ? 'bg-primary/10' : 'bg-muted') : 'bg-card'}`}>
        {label}
      </TableCell>
      {values.map((v, i) => (
        <TableCell key={i} className={`text-right ${v < 0 ? 'text-destructive' : ''}`}>
          {percent ? formatPercent(v) : formatCurrency(Math.abs(v))}
        </TableCell>
      ))}
      <TableCell className={`text-right font-bold bg-primary/5 ${displayTotal < 0 ? 'text-destructive' : ''}`}>
        {percent ? formatPercent(displayTotal) : formatCurrency(Math.abs(displayTotal))}
      </TableCell>
    </TableRow>
  );
}
