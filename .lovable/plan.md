

# Adicionar Margem Líquida e Margem Final ao DRE

## Alterações

### 1. `src/types/simulator.ts` — Adicionar campos ao `MonthlyProjection`
- `margemLiquida: number` (após `resultadoLiquido`)
- `margemFinal: number` (após `resultadoFinal`)

### 2. `src/lib/financial.ts` — Calcular as novas margens
- `margemLiquida = receitaBrutaTotal > 0 ? (resultadoLiquido / receitaBrutaTotal) * 100 : 0`
- `margemFinal = receitaBrutaTotal > 0 ? (resultadoFinal / receitaBrutaTotal) * 100 : 0`
- Incluir ambos no objeto de retorno do mês

### 3. `src/components/simulator/SectionPL.tsx` — Exibir no DRE
- Após a linha `= RESULTADO LÍQUIDO`, adicionar: `Margem Líquida` (percent)
- Após a linha `= RESULTADO FINAL`, adicionar: `Margem Final` (percent)

### 4. `src/lib/exportPdf.ts` e `src/lib/exportExcel.ts` — Incluir nos exports
- Adicionar linhas de `margemLiquida` e `margemFinal` como tipo `percent` após suas respectivas linhas de resultado

