import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from './SectionHeader';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { RevenueRulesData } from '@/types/simulator';

const FIXED_MAPPING = [
  { label: 'Setup', value: 'SAAS' },
  { label: 'Diagnóstico Estratégico', value: 'CAAS' },
  { label: 'CAAS', value: 'CAAS' },
  { label: 'SAAS', value: 'SAAS' },
];

interface Props {
  data: RevenueRulesData;
  onChange: (data: RevenueRulesData) => void;
}

export function SectionRevenueRules({ data, onChange }: Props) {
  const { isAdmin } = useAuth();

  return (
    <section>
      <SectionHeader
        number={8}
        title="Regras Comerciais / Receita"
        description="Revenue share do SAAS, royalties e mapeamento de produtos para o plano de contas."
      />
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="flex flex-col">
              <div className="min-h-[3rem] flex flex-col justify-center mb-1">
                <Label>Revenue Share da Franquia no SAAS (%)</Label>
                {!isAdmin && <Badge variant="outline" className="text-xs gap-1 mt-1 w-fit"><Lock className="w-3 h-3" /> Somente Admin</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-2 min-h-[2rem]">A receita total do SAAS é faturada pela Matriz. A franquia reconhece apenas o revenue share.</p>
              <Input
                type="number" min={0} max={100} step={1}
                value={data.revenueShareSaaS}
                onChange={e => onChange({ ...data, revenueShareSaaS: parseFloat(e.target.value) || 0 })}
                disabled={!isAdmin}
                className={!isAdmin ? 'opacity-60' : ''}
              />
            </div>
            <div className="flex flex-col">
              <div className="min-h-[3rem] flex flex-col justify-center mb-1">
                <Label>Royalties sobre Receita Bruta (%)</Label>
                {!isAdmin && <Badge variant="outline" className="text-xs gap-1 mt-1 w-fit"><Lock className="w-3 h-3" /> Somente Admin</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mb-2 min-h-[2rem]">Incide sobre a receita bruta reconhecida da franquia.</p>
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
              {FIXED_MAPPING.map(item => (
                <div key={item.label} className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/50">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <Badge variant="secondary">{item.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
