import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SectionHeader } from './SectionHeader';
import type { TaxesData } from '@/types/simulator';

const PRODUCTS = [
  { key: 'caas', label: 'CaaS' },
  { key: 'saas', label: 'SaaS' },
  { key: 'education', label: 'Education' },
  { key: 'expansao', label: 'Expansão' },
  { key: 'tax', label: 'Tax' },
];

interface Props {
  data: TaxesData;
  onChange: (data: TaxesData) => void;
}

export function SectionTaxes({ data, onChange }: Props) {
  return (
    <section>
      <SectionHeader
        number={8}
        title="Impostos / Deduções"
        description="Configure as alíquotas manualmente e marque quais impostos se aplicam a cada produto."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Imposto</th>
                  <th className="text-left py-2 pr-4 w-24">Alíquota (%)</th>
                  {PRODUCTS.map(p => (
                    <th key={p.key} className="text-center py-2 px-2">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.impostos.map((imp, idx) => (
                  <tr key={imp.key} className="border-b">
                    <td className="py-2 pr-4 font-medium">{imp.nome}</td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number" min={0} max={100} step={0.01}
                        value={imp.aliquota || ''}
                        onChange={e => {
                          const newImpostos = [...data.impostos];
                          newImpostos[idx] = { ...imp, aliquota: parseFloat(e.target.value) || 0 };
                          onChange({ ...data, impostos: newImpostos });
                        }}
                        placeholder="0"
                        className="w-20 h-8 text-sm"
                      />
                    </td>
                    {PRODUCTS.map(p => (
                      <td key={p.key} className="text-center py-2 px-2">
                        <Checkbox
                          checked={imp.aplicaA[p.key as keyof typeof imp.aplicaA]}
                          onCheckedChange={checked => {
                            const newImpostos = [...data.impostos];
                            newImpostos[idx] = {
                              ...imp,
                              aplicaA: { ...imp.aplicaA, [p.key]: !!checked },
                            };
                            onChange({ ...data, impostos: newImpostos });
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
