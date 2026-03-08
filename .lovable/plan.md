

## Plano: Reduzir largura dos campos de "Ajustes Abaixo do Resultado Operacional"

### Problema
Os inputs ocupam 100% da largura (`grid-cols-1`), criando barras enormes para campos que recebem apenas números curtos (percentuais e valores monetários).

### Solução

**Arquivo:** `src/components/simulator/SectionPL.tsx` (linhas 281-332)

- Trocar o grid de `grid-cols-1` para layout com inputs de largura fixa pequena (`w-32` ou `max-w-[160px]`)
- Nos campos de percentual (Receitas e Despesas Financeiras): limitar o input a `w-24` (~6rem)
- Nos campos de CurrencyInput (PMT e Investimentos): limitar a `w-40` (~10rem) via wrapper `div` com `max-w-[10rem]`
- Manter labels e hints em largura total, apenas os inputs ficam compactos

