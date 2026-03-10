

## Plano: Auto-popular faturamento por BU na Seção de Impostos

### Problema
O campo "Faturamento/mês" na seção 7 (Impostos) é preenchido manualmente, mas o modelo já calcula a receita por BU automaticamente nas projeções. Isso gera inconsistência — o usuário não sabe quanto vai faturar, pois o próprio modelo define isso.

### Solução
Substituir o input manual de `faturamentoBU` por valores calculados automaticamente a partir das projeções. A SectionTaxes passa a receber as projeções e exibe o faturamento médio (ou do último mês) por BU como valor read-only.

### Implementação

**`src/pages/Simulador.tsx`**
- Passar `projections` como prop para `SectionTaxes`

**`src/components/simulator/SectionTaxes.tsx`**
- Receber `projections: MonthlyProjection[]` como prop
- Calcular faturamento médio por BU a partir das projeções (mês 12 ou último mês disponível):
  - CaaS: `projection.receitaBrutaCaas`
  - SaaS: `projection.receitaSaasOxyGenio` (MRR SaaS)
  - Setup: `projection.receitaSetupTotal`
- Substituir o `CurrencyInput` de faturamento por um valor formatado read-only (Badge ou texto)
- Manter o campo `faturamentoTotalMes` e `faturamentoBU` sincronizados com os valores calculados (para que o "Resultado Tributário Calculado" na UI reflita os valores reais)
- Adicionar nota explicativa: "Valores calculados automaticamente pelo modelo"

**Impacto no `financial.ts`**: Nenhum — o engine já usa `revenueByBU` derivado das projeções, não de `taxes.bus[].faturamentoBU`. A mudança é puramente visual/UX.

### Arquivos afetados
- `src/components/simulator/SectionTaxes.tsx` — receber projections, exibir valores calculados
- `src/pages/Simulador.tsx` — passar projections para SectionTaxes

