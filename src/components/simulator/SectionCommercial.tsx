import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { CommercialData } from '@/types/simulator';

interface Props {
  data: CommercialData;
  onChange: (data: CommercialData) => void;
}

export function SectionCommercial({ data, onChange }: Props) {
  const mixTotal = data.mix.caas + data.mix.saas + data.mix.diagnostico;
  const mixValid = mixTotal === data.compromissoMensal;
  const setupAutomatico = data.mix.caas + data.mix.saas;

  return (
    <section>
      <SectionHeader
        number={5}
        title="Premissas Comerciais (Venda Própria)"
        tooltip="Defina seu compromisso de vendas mensais usando seus próprios relacionamentos, sem considerar demandas da Matriz."
      />
      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Commitment slider */}
          <div>
            <Label>Compromisso comercial mensal — quantos projetos por mês?</Label>
            <p className="text-xs text-muted-foreground mb-3">Sem considerar demandas da Matriz, somente seus relacionamentos e outbound.</p>
            <div className="flex items-center gap-4">
              <Slider
                value={[data.compromissoMensal]}
                onValueChange={([v]) => onChange({ ...data, compromissoMensal: v })}
                min={1} max={10} step={1}
                className="flex-1"
              />
              <span className="text-2xl font-bold text-primary w-10 text-center">{data.compromissoMensal}</span>
            </div>
          </div>

          {/* Tickets */}
          <div>
            <Label className="text-base font-semibold">Tickets por produto</Label>
            <div className="grid gap-3 mt-3">
              {data.tickets.map((ticket, idx) => {
                const belowMin = ticket.valor < ticket.minimo && ticket.valor > 0;
                return (
                  <div key={ticket.key} className={`p-3 rounded-lg border ${belowMin ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{ticket.nome}</span>
                      <span className="text-xs text-muted-foreground">
                        Sugerido: {formatCurrency(ticket.sugerido)} · Mínimo: {formatCurrency(ticket.minimo)}
                      </span>
                    </div>
                    <CurrencyInput
                      value={ticket.valor}
                      onChange={(v) => {
                        const newTickets = [...data.tickets];
                        newTickets[idx] = { ...ticket, valor: Math.max(v, ticket.minimo) };
                        onChange({ ...data, tickets: newTickets });
                      }}
                    />
                    {belowMin && (
                      <div className="flex items-center gap-1 mt-1 text-destructive text-xs">
                        <AlertTriangle className="w-3 h-3" /> Valor abaixo do mínimo permitido
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sales mix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Mix de vendas por mês</Label>
              <span className={`text-sm font-medium flex items-center gap-1 ${mixValid ? 'text-primary' : 'text-destructive'}`}>
                {mixValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {mixTotal} de {data.compromissoMensal}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['caas', 'saas', 'diagnostico'] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs">
                    {key === 'caas' ? 'CAAS' : key === 'saas' ? 'SAAS' : 'Diagnóstico'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={data.mix[key]}
                    onChange={e => onChange({ ...data, mix: { ...data.mix, [key]: parseInt(e.target.value) || 0 } })}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>

            {/* Setup automático */}
            <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Setup gerado automaticamente: {setupAutomatico}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                SETUP é obrigatório na contratação de CAAS e/ou SAAS e será calculado automaticamente (CAAS + SAAS).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
