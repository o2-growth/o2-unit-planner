

## Plano: Ajustes finais — banners motivacionais e BUs de impostos

### Parte 1 — Remover banners motivacionais
**Arquivo:** `src/pages/Index.tsx`
- Remover o bloco entre `SectionProfile` e `SectionGoals` (linhas 280-290) — card com "Muito obrigado por suas respostas..."
- Remover o bloco entre `SectionGoals` e `SectionHorizon` (linhas 294-304) — card com "Excelente. Bora para os números."
- Remover as funções `isProfileDone` e `isGoalsDone` (linhas 86-91) e as variáveis `profileDone`/`goalsDone` (linhas 240-241), já que não terão mais uso

### Parte 2 — Remover Education, Expansão e Tax da tabela de BUs em impostos
**Arquivo:** `src/types/simulator.ts`
- Remover as 3 entradas de `DEFAULT_BUS`: education, expansao, tax
- Manter apenas: CaaS, SaaS, Setup

**Arquivo:** `src/pages/Index.tsx`
- Atualizar a migração para filtrar BUs removidas do estado salvo (filtrar por `buKey` in `['caas','saas','setup']`)
- Corrigir o `DEFAULT_BUS[i % DEFAULT_BUS.length]` para usar lookup por `buKey` em vez de índice

**Arquivo:** `src/lib/financial.ts`
- Verificar que o cálculo de impostos por BU funciona com qualquer quantidade de BUs (já itera `data.taxes.bus`, sem problema)

