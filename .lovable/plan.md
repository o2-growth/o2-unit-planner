

## Plano: Mover Setup Matriz para SAAS + drilldown

### Resumo

Atualmente `setupMatriz` (`clientesMes × setupPorCliente`) entra na linha **Expansão**. Vamos movê-lo para **SAAS** e adicionar drilldown visual mostrando "SAAS OXY+GENIO" e "SETUP" como sub-linhas.

### 1. `src/lib/financial.ts` — Mover setupMatriz para rbSaas

```
// Antes:
const rbSaas = mrrSaasOwn + setupOwn;
const rbExpansao = recDiag + setupMatriz;

// Depois:
const rbSaas = mrrSaasOwn + setupOwn + setupMatriz;
const rbExpansao = recDiag;
```

Também atualizar `revenueByProduct` para que `setup` use `setupOwn + setupMatriz` (impactos fiscais corretos).

### 2. `src/types/simulator.ts` — Adicionar campo `receitaSaasOxyGenio`

Novo campo no `MonthlyProjection` para permitir drilldown:
- `receitaSaasOxyGenio` = `mrrSaasOwn` (receita recorrente SAAS pura)
- `receitaSetupTotal` = `setupOwn + setupMatriz` (todo setup consolidado)

O campo `receitaBrutaSaas` continua sendo o total (OXY+GENIO + Setup).

### 3. `src/components/simulator/SectionPL.tsx` — Drilldown na linha SAAS

Substituir a linha única "SAAS + Setup" por:
- **SAAS** (total, com expand)
  - **OXY+GENIO** (recorrente)
  - **SETUP** (pontual: próprio + matriz)

### 4. `src/components/simulator/SectionCharts.tsx` — Atualizar gráfico

Ajustar dados do gráfico para refletir a nova composição (Setup sai de Expansão, entra em SAAS).

### 5. `src/lib/exportPdf.ts` e `src/lib/exportExcel.ts` — Drilldown no export

Adicionar sub-linhas "OXY+GENIO" e "SETUP" abaixo de SAAS nos exports.

### Arquivos afetados
- `src/lib/financial.ts` — fórmula rbSaas/rbExpansao
- `src/types/simulator.ts` — novos campos drilldown
- `src/components/simulator/SectionPL.tsx` — drilldown visual
- `src/components/simulator/SectionCharts.tsx` — gráfico
- `src/lib/exportPdf.ts` — PDF export
- `src/lib/exportExcel.ts` — Excel export

