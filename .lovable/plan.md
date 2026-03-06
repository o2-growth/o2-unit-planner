

## Plano: 6 ajustes de design

### Parte 1 — Seção 4: Remover slider de clientes, usar input numérico
**Arquivo:** `src/components/simulator/SectionCommercial.tsx`
- Remover o `<Slider>` e substituir por um `<Input type="number">` para o compromisso mensal de novos clientes
- Manter o label e descrição existentes

### Parte 2 — Seção 7: Simplificar colunas de impostos
**Arquivo:** `src/components/simulator/SectionTaxes.tsx`
- Remover colunas `Education`, `Expansão` e `Tax` do array `PRODUCTS`
- Substituir por apenas: `CaaS`, `SaaS`, `Setup`, `Demais Produtos`
- Para "Demais Produtos", usar uma nova key (ex: `demais`) que agrega os valores — ou simplificar para que `demais` funcione como coluna única com sua própria alíquota no `aplicaA`
- Atualizar `TaxConfig.aplicaA` no tipo para incluir `demais` e manter retrocompatibilidade

### Parte 3 — Seção 8: Toda a seção visível apenas para admin
**Arquivo:** `src/components/simulator/SectionRevenueRules.tsx`
- Envolver toda a seção em um condicional `isAdmin` — se não for admin, ocultar completamente (ou mostrar card fechado com badge "Somente Admin")

### Parte 4 — Premissas de Ajuste Rápido: Collapsible
**Arquivo:** `src/components/simulator/PremissasHeader.tsx`
- Envolver o conteúdo em um `Collapsible` do Radix, iniciando fechado (`defaultOpen={false}`)
- O header (título + botão restaurar) fica sempre visível como `CollapsibleTrigger`
- O conteúdo dos campos fica dentro de `CollapsibleContent`

### Parte 5 — Seção 9: Remover custos variáveis desnecessários
**Arquivos:** `src/types/simulator.ts` (INITIAL_STATE) + `src/components/simulator/SectionPL.tsx`
- Remover do `variableCostRates` default: Education, Customer Success, Expansão, Tax
- Manter apenas: Custos CAAS e Custos SAAS
- Atualizar migração se necessário

### Parte 6 — Seção 9: Ajustes Abaixo do Resultado Operacional em coluna
**Arquivo:** `src/components/simulator/SectionPL.tsx`
- Trocar o grid `grid-cols-2 md:grid-cols-4` por `grid-cols-1` (um campo abaixo do outro)
- Cada campo ocupa uma linha inteira

### Arquivos afetados
- `src/components/simulator/SectionCommercial.tsx`
- `src/components/simulator/SectionTaxes.tsx`
- `src/components/simulator/SectionRevenueRules.tsx`
- `src/components/simulator/PremissasHeader.tsx`
- `src/components/simulator/SectionPL.tsx`
- `src/types/simulator.ts`

