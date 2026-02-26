import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { SectionHeader } from './SectionHeader';
import { CurrencyInput } from './CurrencyInput';
import type { ProfileData } from '@/types/simulator';

const EXP_OPTIONS = ['01 a 5 anos', '5 a 10 anos', '10 a 15 anos', '15 a 20 anos', 'Mais de 20 anos'];

interface Props {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
}

export function SectionProfile({ data, onChange }: Props) {
  const update = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <section>
      <SectionHeader number={1} title="Perfil do Novo Sócio" description="Identificação e perfil comercial atual" />
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label>Nome do novo Sócio O2 Inc.</Label>
            <Input value={data.nome} onChange={e => update('nome', e.target.value)} placeholder="Seu nome completo" className="mt-1" />
          </div>

          <div>
            <Label>Anos de experiência na área</Label>
            <RadioGroup value={data.experiencia} onValueChange={v => update('experiencia', v)} className="mt-2 flex flex-wrap gap-2">
              {EXP_OPTIONS.map(opt => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`exp-${opt}`} />
                  <Label htmlFor={`exp-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center gap-3">
            <Label>Já possuo uma Consultoria Financeira/Empresarial</Label>
            <Switch checked={data.possuiConsultoria} onCheckedChange={v => update('possuiConsultoria', v)} />
            <span className="text-sm text-muted-foreground">{data.possuiConsultoria ? 'Sim' : 'Não'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Quantos clientes ativos eu tenho?</Label>
              <Input type="number" min={0} value={data.clientesAtivos || ''} onChange={e => update('clientesAtivos', parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
            <div>
              <Label>Qual o ticket médio?</Label>
              <CurrencyInput value={data.ticketMedio} onChange={v => update('ticketMedio', v)} />
            </div>
          </div>

          <div>
            <Label>Qual a receita total mensal recorrente hoje?</Label>
            <CurrencyInput value={data.receitaMensal} onChange={v => update('receitaMensal', v)} />
          </div>

          <div className="flex items-center gap-3">
            <Label>Possui funcionários/colaboradores/prestadores exclusivos?</Label>
            <Switch checked={data.possuiFuncionarios} onCheckedChange={v => update('possuiFuncionarios', v)} />
            <span className="text-sm text-muted-foreground">{data.possuiFuncionarios ? 'Sim' : 'Não'}</span>
          </div>

          {data.possuiFuncionarios && (
            <>
              <div>
                <Label>Se sim, quantos?</Label>
                <Input type="number" min={0} value={data.quantosFuncionarios || ''} onChange={e => update('quantosFuncionarios', parseInt(e.target.value) || 0)} className="mt-1" />
              </div>
              <div>
                <Label>Qual o CUSTO TOTAL MENSAL destes funcionários?</Label>
                <CurrencyInput value={data.custoFuncionarios} onChange={v => update('custoFuncionarios', v)} />
              </div>
            </>
          )}

          <div>
            <Label>Qual seu pró-labore/retirada mensal atual?</Label>
            <CurrencyInput value={data.proLaboreAtual} onChange={v => update('proLaboreAtual', v)} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
