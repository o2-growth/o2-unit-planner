import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import type { MatrixClientsData, GrowthType } from '@/types/simulator';

interface Props {
  data: MatrixClientsData;
  onChange: (data: MatrixClientsData) => void;
}

export function SectionMatrixClients({ data, onChange }: Props) {
  const update = <K extends keyof MatrixClientsData>(key: K, value: MatrixClientsData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <section>
      <SectionHeader
        number={5}
        title="Clientes Comprados da Matriz"
        description="Tese de crescimento via compra de clientes da Matriz"
        tooltip="Cada cliente comprado gera receita de Setup (one-off) + MRR recorrente, com custo de aquisição (CAC)."
      />
      <Card className="border-primary/30 bg-accent/30">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label>Quantidade de clientes para comprar da Matriz por mês (mês 1)</Label>
            <Input type="number" min={0} value={data.qtdMensalInicial || ''} onChange={e => update('qtdMensalInicial', parseInt(e.target.value) || 0)} className="mt-1" />
          </div>

          <div>
            <Label>Crescimento mensal na compra de clientes</Label>
            <RadioGroup value={data.tipoCresc} onValueChange={v => update('tipoCresc', v as GrowthType)} className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="gc-fixed" />
                <Label htmlFor="gc-fixed" className="font-normal cursor-pointer">Sem crescimento (volume fixo)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incremental" id="gc-inc" />
                <Label htmlFor="gc-inc" className="font-normal cursor-pointer">Crescimento fixo em quantidade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="gc-pct" />
                <Label htmlFor="gc-pct" className="font-normal cursor-pointer">Crescimento percentual</Label>
              </div>
            </RadioGroup>
          </div>

          {data.tipoCresc === 'incremental' && (
            <div>
              <Label>Incremento de clientes por mês</Label>
              <Input type="number" min={0} value={data.incremClientes || ''} onChange={e => update('incremClientes', parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
          )}

          {data.tipoCresc === 'percentage' && (
            <div>
              <Label>Crescimento mensal (%)</Label>
              <Input type="number" min={0} step={0.1} value={data.percCresc || ''} onChange={e => update('percCresc', parseFloat(e.target.value) || 0)} className="mt-1" />
            </div>
          )}

          <div>
            <Label>Preço por cliente comprado (CAC simbólico)</Label>
            <CurrencyInput value={data.cacPorCliente} onChange={v => update('cacPorCliente', v)} />
            <p className="text-xs text-muted-foreground mt-1">Custo de aquisição do cliente comprado da Matriz. Irá para a linha de CAC no DRE.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Setup por cliente comprado</Label>
              <CurrencyInput value={data.setupPorCliente} onChange={v => update('setupPorCliente', v)} />
            </div>
            <div>
              <Label>MRR por cliente comprado</Label>
              <CurrencyInput value={data.mrrPorCliente} onChange={v => update('mrrPorCliente', v)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 italic">
            Este ticket está mais relacionado ao mínimo da matriz do que ao potencial da franquia, pois nascerá do inbound sales da matriz.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
