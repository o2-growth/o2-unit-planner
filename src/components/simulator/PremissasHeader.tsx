import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from './CurrencyInput';
import { Settings2 } from 'lucide-react';
import type { SimulatorState } from '@/types/simulator';

interface Props {
  state: SimulatorState;
  onUpdate: <K extends keyof SimulatorState>(key: K, value: SimulatorState[K]) => void;
}

export function PremissasHeader({ state, onUpdate }: Props) {
  const { commercial, matrixClients, churn, goals } = state;

  const updateTicket = (key: string, valor: number) => {
    const tickets = commercial.tickets.map(t => t.key === key ? { ...t, valor } : t);
    onUpdate('commercial', { ...commercial, tickets });
  };

  const updateMix = (key: string, value: number) => {
    onUpdate('commercial', { ...commercial, mix: { ...commercial.mix, [key]: value } });
  };

  return (
    <Card className="border-primary/30 bg-accent/20">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold">Premissas da Simulação — Ajuste Rápido</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Horizonte */}
          <div>
            <Label className="text-xs">Horizonte (meses)</Label>
            <Select value={String(state.horizonte)} onValueChange={v => onUpdate('horizonte', Number(v))}>
              <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[12, 18, 24, 36, 48, 60].map(m => (
                  <SelectItem key={m} value={String(m)}>{m} meses</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mix */}
          <div>
            <Label className="text-xs">CAAS/mês</Label>
            <Input type="number" min={0} value={commercial.mix.caas} onChange={e => updateMix('caas', parseInt(e.target.value) || 0)} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">SAAS/mês</Label>
            <Input type="number" min={0} value={commercial.mix.saas} onChange={e => updateMix('saas', parseInt(e.target.value) || 0)} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Diagnóstico/mês</Label>
            <Input type="number" min={0} value={commercial.mix.diagnostico} onChange={e => updateMix('diagnostico', parseInt(e.target.value) || 0)} className="mt-1 h-9 text-xs" />
          </div>

          {/* Tickets */}
          <div>
            <Label className="text-xs">Ticket CAAS</Label>
            <CurrencyInput value={commercial.tickets.find(t => t.key === 'caas')?.valor || 0} onChange={v => updateTicket('caas', v)} className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ticket SAAS</Label>
            <CurrencyInput value={commercial.tickets.find(t => t.key === 'saas')?.valor || 0} onChange={v => updateTicket('saas', v)} className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ticket Diagnóstico</Label>
            <CurrencyInput value={commercial.tickets.find(t => t.key === 'diagnostico')?.valor || 0} onChange={v => updateTicket('diagnostico', v)} className="h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Ticket Setup (auto)</Label>
            <CurrencyInput value={commercial.tickets.find(t => t.key === 'setup')?.valor || 0} onChange={v => updateTicket('setup', v)} className="h-9 text-xs" />
          </div>

          {/* Churn */}
          <div>
            <Label className="text-xs">Churn MRR (%)</Label>
            <Input type="number" min={0} max={100} step={0.1} value={churn.churnMensal || ''} onChange={e => onUpdate('churn', { churnMensal: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 text-xs" />
          </div>

          {/* Matrix */}
          <div>
            <Label className="text-xs">Clientes Matriz (mês 1)</Label>
            <Input type="number" min={0} value={matrixClients.qtdMensalInicial} onChange={e => onUpdate('matrixClients', { ...matrixClients, qtdMensalInicial: parseInt(e.target.value) || 0 })} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">CAC/cliente</Label>
            <CurrencyInput value={matrixClients.cacPorCliente} onChange={v => onUpdate('matrixClients', { ...matrixClients, cacPorCliente: v })} className="h-9 text-xs" />
          </div>

          {/* Pro-labore */}
          <div>
            <Label className="text-xs">Pró-labore alvo</Label>
            <CurrencyInput value={goals.proLabore12m} onChange={v => onUpdate('goals', { ...goals, proLabore12m: v })} className="h-9 text-xs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
