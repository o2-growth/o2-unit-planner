import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from './CurrencyInput';
import { Settings2, RotateCcw, Info } from 'lucide-react';
import type { SimulatorState } from '@/types/simulator';

interface Props {
  state: SimulatorState;
  onUpdate: <K extends keyof SimulatorState>(key: K, value: SimulatorState[K]) => void;
  onResetPremissas: () => void;
}

export function PremissasHeader({ state, onUpdate, onResetPremissas }: Props) {
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold">Premissas da Simulação — Ajuste Rápido</h3>
          </div>
          <Button variant="outline" size="sm" onClick={onResetPremissas} className="gap-1 text-xs">
            <RotateCcw className="w-3 h-3" /> Restaurar Respostas Oficiais
          </Button>
        </div>
        <div className="flex items-start gap-1 mb-4 text-xs text-muted-foreground">
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <span>Os números abaixo foram puxados das suas respostas anteriores, mas podem ser alterados diretamente aqui para fins de projeção do DRE.</span>
        </div>
        {/* Campos Globais */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
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
          <div>
            <Label className="text-xs">Churn MRR (%)</Label>
            <Input type="number" min={0} max={100} step={0.1} value={churn.churnMensal || ''} onChange={e => onUpdate('churn', { churnMensal: parseFloat(e.target.value) || 0 })} className="mt-1 h-9 text-xs" />
          </div>
          <div>
            <Label className="text-xs">Pró-labore alvo</Label>
            <CurrencyInput value={goals.proLabore12m} onChange={v => onUpdate('goals', { ...goals, proLabore12m: v })} className="h-9 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bloco Venda Própria (Seção 4) */}
          <div className="border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-primary mb-2">📊 Venda Própria (Seção 4)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            </div>
          </div>

          {/* Bloco Clientes Matriz (Seção 5) */}
          <div className="border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-primary mb-2">🏢 Clientes Matriz (Seção 5)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Clientes/mês (mês 1)</Label>
                <Input type="number" min={0} value={matrixClients.qtdMensalInicial} onChange={e => onUpdate('matrixClients', { ...matrixClients, qtdMensalInicial: parseInt(e.target.value) || 0 })} className="mt-1 h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">CAC/cliente</Label>
                <CurrencyInput value={matrixClients.cacPorCliente} onChange={v => onUpdate('matrixClients', { ...matrixClients, cacPorCliente: v })} className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Setup/cliente</Label>
                <CurrencyInput value={matrixClients.setupPorCliente} onChange={v => onUpdate('matrixClients', { ...matrixClients, setupPorCliente: v })} className="h-9 text-xs" />
              </div>
              <div>
                <Label className="text-xs">MRR/cliente</Label>
                <CurrencyInput value={matrixClients.mrrPorCliente} onChange={v => onUpdate('matrixClients', { ...matrixClients, mrrPorCliente: v })} className="h-9 text-xs" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
