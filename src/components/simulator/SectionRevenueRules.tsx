import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from './SectionHeader';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { RevenueRulesData } from '@/types/simulator';

const PLAN_ACCOUNTS = ['caas', 'saas', 'education', 'expansao', 'tax'];

interface Props {
  data: RevenueRulesData;
  onChange: (data: RevenueRulesData) => void;
}

export function SectionRevenueRules({ data, onChange }: Props) {
  const { isAdmin } = useAuth();

  return (
    <section>
      <SectionHeader
        number={9}
        title="Regras Comerciais / Receita"
        description="Revenue share do SAAS, royalties e mapeamento de produtos para o plano de contas."
      />
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label>Revenue Share da Franquia no SAAS (%)</Label>
                {!isAdmin && <Badge variant="outline" className="text-xs gap-1"><Lock className="w-3 h-3" /> Somente Admin</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-1">A receita total do SAAS é faturada pela Matriz. A franquia reconhece apenas o revenue share.</p>
              <Input
                type="number" min={0} max={100} step={1}
                value={data.revenueShareSaaS}
                onChange={e => onChange({ ...data, revenueShareSaaS: parseFloat(e.target.value) || 0 })}
                disabled={!isAdmin}
                className={!isAdmin ? 'opacity-60' : ''}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label>Royalties sobre Receita Bruta (%)</Label>
                {!isAdmin && <Badge variant="outline" className="text-xs gap-1"><Lock className="w-3 h-3" /> Somente Admin</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-1">Incide sobre a receita bruta reconhecida da franquia.</p>
              <Input
                type="number" min={0} max={100} step={1}
                value={data.royalties}
                onChange={e => onChange({ ...data, royalties: parseFloat(e.target.value) || 0 })}
                disabled={!isAdmin}
                className={!isAdmin ? 'opacity-60' : ''}
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
                { key: 'saas', label: 'SAAS' },
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
