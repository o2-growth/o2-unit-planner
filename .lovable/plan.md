

## Plano: Mostrar linha de Pró-labore Sócios no DRE

### Problema
No `financial.ts` (linhas 196-198), quando `proLaboreMode === 'distribuicao'`, o pró-labore é subtraído do `resultadoFinal`, mas não existe campo nem linha visível no DRE mostrando esse desconto. No modo `custo_fixo`, aparece como "Pessoal (pró-labore)" nas despesas fixas, mas no modo distribuição fica invisível.

### Solução

**1. `src/types/simulator.ts` — Adicionar campo ao `MonthlyProjection`**
- Adicionar `proLaboreDistribuicao: number` — valor deduzido do resultado final quando modo = distribuição

**2. `src/lib/financial.ts` — Preencher o novo campo**
- Calcular `proLaboreDistribuicao = proLaboreMode === 'distribuicao' && resultadoLiquido - amortização - investimentos > 0 ? proLaboreValue : 0`
- Usar esse valor na subtração do `resultadoFinal`
- Incluir no objeto `months.push()`

**3. `src/components/simulator/SectionPL.tsx` — Adicionar linha no DRE**
- Entre "(-) Investimentos" e "= RESULTADO FINAL", adicionar:
  - `(-) Pró-labore (distribuição)` — mostrando `p.proLaboreDistribuicao`
  - Só visível quando `proLaboreMode === 'distribuicao'`

**4. `src/lib/exportExcel.ts` — Adicionar linha no Excel**
- Adicionar `proLaboreDistribuicao` no array `DRE_ROWS` na posição correta (antes de `resultadoFinal`)

**5. `src/lib/exportPdf.ts` — Adicionar linha no PDF**
- Incluir a linha de pró-labore distribuição no export PDF

### Arquivos afetados
- `src/types/simulator.ts`
- `src/lib/financial.ts`
- `src/components/simulator/SectionPL.tsx`
- `src/lib/exportExcel.ts`
- `src/lib/exportPdf.ts`

