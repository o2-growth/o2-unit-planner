import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from './SectionHeader';
import type { RevenueRulesData } from '@/types/simulator';

const PLAN_ACCOUNTS = ['caas', 'saas', 'education', 'expansao', 'tax'];

interface Props {
  data: RevenueRulesData;
  onChange: (data: RevenueRulesData) => void;
}

export function SectionRevenueRules({ data, onChange }: Props) {
  return (
    <section>
      <SectionHeader
        number={9}
        title="Regras Comerciais / Receita"
        description="Revenue share do SaaS, royalties e mapeamento de produtos para o plano de contas."
      />
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Revenue Share da Franquia no SaaS (%)</Label>
              <p className="text-xs text-muted-foreground mb-1">A receita total do SaaS é faturada pela Matriz. A franquia reconhece apenas o revenue share.</p>
              <Input
                type="number" min={0} max={100} step={1}
                value={data.revenueShareSaaS}
                onChange={e => onChange({ ...data, revenueShareSaaS: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Royalties sobre Receita Bruta (%)</Label>
              <p className="text-xs text-muted-foreground mb-1">Incide sobre a receita bruta reconhecida da franquia.</p>
              <Input
                type="number" min={0} max={100} step={1}
                value={data.royalties}
                onChange={e => onChange({ ...data, royalties: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Mapeamento de Produtos → Plano de Contas</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {[
                { key: 'setup', label: 'Setup' },
                { key: 'diagnostico', label: 'Diagnóstico Estratégico' },
                { key: 'caas', label: 'CAAS' },
                { key: 'saas', label: 'SaaS' },
              ].map(item => (
                <div key={item.key}>
                  <Label className="text-sm">{item.label} →</Label>
                  <Select
                    value={data.mapeamento[item.key as keyof typeof data.mapeamento]}
                    onValueChange={v => onChange({ ...data, mapeamento: { ...data.mapeamento, [item.key]: v } })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_ACCOUNTS.map(a => (
                        <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
