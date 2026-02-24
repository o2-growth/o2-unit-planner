

# Alinhar Altura dos Widgets "Ajustes Abaixo do EBITDA"

## Problema
Os 4 widgets (Receitas Financeiras, Despesas Financeiras, PMT Emprestimo, Investimentos) estao com alturas diferentes porque alguns tem texto auxiliar e outros nao. O campo "Investimentos" fica desalinhado em relacao aos demais.

## Solucao
Adicionar `items-start` no grid container para que todos os widgets se alinhem pelo topo, e usar `flex flex-col h-full` em cada widget para que ocupem a mesma altura dentro do grid. Isso fara com que os inputs fiquem todos na mesma linha horizontal.

## Arquivo modificado

### `src/components/simulator/SectionPL.tsx`
- Linha 118: Adicionar `items-start` ao grid container e trocar para `items-stretch` para forcar mesma altura
- Cada div filho (linhas 120, 134, 152, 165) recebe `flex flex-col` para empilhar label + input + helper text de forma consistente
- O input fica sempre na mesma posicao vertical em todos os widgets

Mudanca principal: o grid passa de `grid grid-cols-2 md:grid-cols-4 gap-3` para `grid grid-cols-2 md:grid-cols-4 gap-3 items-start`, e cada coluna interna usa `flex flex-col justify-between` para distribuir o espaco uniformemente.
