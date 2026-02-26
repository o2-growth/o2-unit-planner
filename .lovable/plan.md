

## Plano: Aplicar churn sobre receita pré-existente

### O que muda

Atualmente, `receitaPreExistente` é um valor fixo lido de `state.profile.receitaMensal` e somado todo mês sem sofrer churn. A mudança é transformá-la em uma variável acumulada (como `mrrCaasOwn`) que sofre churn mês a mês.

### Alteração em `src/lib/financial.ts`

1. **Criar variável acumulada** `mrrPreExistente` inicializada com `state.profile.receitaMensal` antes do loop (ao lado de `mrrCaasOwn`, `mrrSaasOwn`, `mrrMatriz`).

2. **Incluir `mrrPreExistente` no bloco de churn** — aplicar `mrrPreExistente *= factor` junto com os demais MRRs. Incluir no cálculo de `totalMrrBefore` e `churnValor`.

3. **Remover a constante `receitaPreExistente`** de dentro do loop e usar `mrrPreExistente` no lugar:
   - `rbCaas = mrrCaasOwn + mrrMatriz + mrrPreExistente` (em vez de `+ receitaPreExistente`)

4. **No objeto `months.push`**, atualizar `receitaPreExistente` para usar o valor corrente de `mrrPreExistente` (que diminui ao longo do tempo) e incluí-lo no `mrrTotal`.

### Impacto

- A receita pré-existente será corroída pelo churn mês a mês, refletindo perda natural de clientes da base original.
- Mês 1: valor cheio. Mês 2 em diante: reduzido por `(1 - churnRate)` cumulativamente.
- Todos os cálculos downstream (receita bruta, impostos, DRE) são afetados automaticamente pois dependem de `rbCaas`.

