import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from './SectionHeader';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { TaxesData } from '@/types/simulator';

const PRODUCTS = [
  { key: 'caas', label: 'CaaS' },
  { key: 'saas', label: 'SaaS' },
  { key: 'setup', label: 'Setup' },
  { key: 'education', label: 'Education' },
  { key: 'expansao', label: 'Expansão' },
  { key: 'tax', label: 'Tax' },
];

interface Props {
  data: TaxesData;
  onChange: (data: TaxesData) => void;
}

export function SectionTaxes({ data, onChange }: Props) {
  const { isAdmin } = useAuth();

  return (
    <section>
      <SectionHeader
        number={7}
        title="Impostos / Deduções"
        description="Alíquota específica de cada imposto por BU."
      />
      <Card>
        <CardContent className="pt-6">
          {!isAdmin && (
            <Badge variant="outline" className="text-xs gap-1 mb-4 w-fit">
              <Lock className="w-3 h-3" /> Somente Admin
            </Badge>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Imposto</th>
                  {PRODUCTS.map(p => (
                    <th key={p.key} className="text-center py-2 px-2">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.impostos.map((imp, idx) => (
                  <tr key={imp.key} className="border-b">
                    <td className="py-2 pr-4 font-medium">{imp.nome}</td>
                    {PRODUCTS.map(p => (
                      <td key={p.key} className="text-center py-2 px-2">
                        <Input
                          type="number" min={0} max={100} step={0.01}
                          value={imp.aplicaA[p.key as keyof typeof imp.aplicaA] || ''}
                          onChange={e => {
                            const newImpostos = [...data.impostos];
                            newImpostos[idx] = {
                              ...imp,
                              aplicaA: { ...imp.aplicaA, [p.key]: parseFloat(e.target.value) || 0 },
                            };
                            onChange({ ...data, impostos: newImpostos });
                          }}
                          placeholder="0"
                          disabled={!isAdmin}
                          className={`w-20 h-8 text-sm text-center ${!isAdmin ? 'opacity-60' : ''}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  {PRODUCTS.map(p => {
                    const total = data.impostos.reduce(
                      (sum, imp) => sum + (imp.aplicaA[p.key as keyof typeof imp.aplicaA] || 0),
                      0
                    );
                    return (
                      <td key={p.key} className="text-center py-2 px-2">
                        {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
