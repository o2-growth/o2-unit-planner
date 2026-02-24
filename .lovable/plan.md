
# Fixar Mapeamento de Produtos como Regra

## O que muda
O mapeamento de produtos para o plano de contas deixa de ser configuravel (dropdowns) e passa a ser uma regra fixa exibida apenas como texto informativo:

- **Setup** → SAAS
- **Diagnostico Estrategico** → CAAS
- **CAAS** → CAAS
- **SAAS** → SAAS

## Detalhes Tecnicos

### Arquivo: `src/types/simulator.ts`
- Alterar o valor default do `mapeamento` de `{ setup: 'expansao', diagnostico: 'expansao', caas: 'caas', saas: 'saas' }` para `{ setup: 'saas', diagnostico: 'caas', caas: 'caas', saas: 'saas' }`
- O tipo pode permanecer no `RevenueRulesData` para manter compatibilidade, mas o valor sera sempre fixo

### Arquivo: `src/components/simulator/SectionRevenueRules.tsx`
- Remover os `Select` dropdowns do mapeamento
- Substituir por texto estatico mostrando cada mapeamento como label (ex: "Setup → SAAS", "CAAS → CAAS")
- Remover imports nao utilizados (`Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`)
- Remover constante `PLAN_ACCOUNTS`
- O `onChange` nao precisa mais atualizar o mapeamento — os valores ficam fixos no default

### Garantia de consistencia
- Como o `mapeamento` nao e usado em nenhum outro arquivo alem do tipo e do componente, nao ha impacto em calculos. Se futuramente for usado nos calculos do DRE, os valores fixos do default serao lidos corretamente.
