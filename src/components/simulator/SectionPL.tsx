import { Card, CardContent } from '@/components/ui/card';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import type { MonthlyProjection, CostLine } from '@/types/simulator';

type BelowEbitdaData = {
  recFinanceiras: number;
  despFinanceiras: number;
  outrasReceitas: number;
  despNaoOperacionais: number;
  provisaoIRCSLL: number;
  amortizacao: number;
  investimentosMensal: number;
};

interface Props {
  projections: MonthlyProjection[];
  fixedCosts: CostLine[];
  variableCostRates: CostLine[];
  belowEbitda: BelowEbitdaData;
  onFixedCostsChange: (costs: CostLine[]) => void;
  onVariableCostsChange: (costs: CostLine[]) => void;
  onBelowEbitdaChange: (data: BelowEbitdaData) => void;
}

export function SectionPL({ projections, fixedCosts, variableCostRates, belowEbitda, onFixedCostsChange, onVariableCostsChange, onBelowEbitdaChange }: Props) {
  const updateFixed = (idx: number, val: number) => {
    const n = [...fixedCosts];
    n[idx] = { ...n[idx], valorMensal: val };
    onFixedCostsChange(n);
  };
  const updateVariable = (idx: number, val: number) => {
    const n = [...variableCostRates];
    n[idx] = { ...n[idx], valorMensal: val };
    onVariableCostsChange(n);
  };

  return (
    <section>
      <SectionHeader number={10} title="P&L / DRE Gerencial" description="Plano de contas completo com visão mensal" />

      {/* Editable costs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardContent className="pt-4">
            <Label className="text-base font-semibold mb-3 block">Custos Variáveis (R$/mês)</Label>
            {variableCostRates.map((c, i) => (
              <div key={c.key} className="mb-2">
                <Label className="text-xs">{c.nome}</Label>
                <CurrencyInput value={c.valorMensal} onChange={v => updateVariable(i, v)} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Label className="text-base font-semibold mb-3 block">Despesas Fixas (R$/mês)</Label>
            {fixedCosts.map((c, i) => (
              <div key={c.key} className="mb-2">
                <Label className="text-xs">{c.nome}</Label>
                <CurrencyInput value={c.valorMensal} onChange={v => updateFixed(i, v)} />
              </div>
            ))}
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
              { key: 'outrasReceitas', label: 'Outras Receitas' },
              { key: 'despNaoOperacionais', label: 'Desp. Não Operacionais' },
              { key: 'provisaoIRCSLL', label: 'Provisão IRPJ/CSLL' },
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
              <TableRow className="bg-o2-black text-primary-foreground">
                <TableHead className="text-primary-foreground font-bold sticky left-0 bg-o2-black z-10">Linha</TableHead>
                {projections.map(p => (
                  <TableHead key={p.month} className="text-primary-foreground text-center min-w-[100px]">Mês {p.month}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <DRERow label="= RECEITA BRUTA" values={projections.map(p => p.receitaBrutaTotal)} highlight />
              <DRERow label="  CAAS" values={projections.map(p => p.receitaBrutaCaas)} />
              <DRERow label="  SAAS" values={projections.map(p => p.receitaBrutaSaas)} />
              <DRERow label="  Setup" values={projections.map(p => p.receitaBrutaSetup)} />
              <DRERow label="  Education" values={projections.map(p => p.receitaBrutaEducation)} />
              <DRERow label="  Expansão" values={projections.map(p => p.receitaBrutaExpansao)} />
              <DRERow label="  Tax" values={projections.map(p => p.receitaBrutaTax)} />
              <DRERow label="(-) Deduções de Vendas" values={projections.map(p => -p.deducoes)} negative />
              <DRERow label="= RECEITA LÍQUIDA" values={projections.map(p => p.receitaLiquida)} highlight />
              <DRERow label="(-) Custos Variáveis" values={projections.map(p => -p.custosVariaveisTotal)} negative />
              <DRERow label="  Royalties" values={projections.map(p => -p.royaltiesValor)} negative />
              <DRERow label="  CAC Matriz" values={projections.map(p => -p.cacTotal)} negative />
              <DRERow label="= LUCRO BRUTO" values={projections.map(p => p.lucroBruto)} highlight />
              <DRERow label="  Margem Bruta" values={projections.map(p => p.margemBruta)} percent />
              <DRERow label="(-) Despesas Fixas" values={projections.map(p => -p.despFixasTotal)} negative />
              <DRERow label="= EBITDA" values={projections.map(p => p.ebitda)} highlight />
              <DRERow label="  Margem EBITDA" values={projections.map(p => p.margemEbitda)} percent />
              <DRERow label="= RESULTADO LÍQUIDO" values={projections.map(p => p.resultadoLiquido)} highlight />
              <DRERow label="= RESULTADO FINAL" values={projections.map(p => p.resultadoFinal)} highlight primary />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
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
  return (
    <TableRow className={highlight ? (primary ? 'bg-primary/10 font-bold' : 'bg-muted font-semibold') : ''}>
      <TableCell className={`sticky left-0 z-10 whitespace-nowrap ${highlight ? (primary ? 'bg-primary/10' : 'bg-muted') : 'bg-card'}`}>
        {label}
      </TableCell>
      {values.map((v, i) => (
        <TableCell key={i} className={`text-right ${v < 0 ? 'text-destructive' : ''}`}>
          {percent ? formatPercent(v) : formatCurrency(Math.abs(v))}
        </TableCell>
      ))}
    </TableRow>
  );
}
