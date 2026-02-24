
# Correções no DRE, Gráficos e Tabela de Resultados

## 1. Scroll quebrado no DRE (coluna sticky sobrepondo valores)

**Arquivo:** `src/components/simulator/SectionPL.tsx`

- A coluna "Linha" usa `sticky left-0` mas não tem largura fixa definida, causando sobreposição com os valores ao rolar horizontalmente
- Corrigir: adicionar `min-w-[220px] w-[220px]` na coluna sticky e garantir que tenha `bg-card` ou `bg-muted` sólido (sem transparência) em todas as linhas (GroupRow e DRERow)
- Garantir que o `overflow-x-auto` está no container correto e que a tabela tem `table-layout: auto` ou largura mínima suficiente

## 2. Coluna "Total" acumulado no DRE

**Arquivo:** `src/components/simulator/SectionPL.tsx`

- Adicionar uma coluna "Total" após todos os meses no `TableHeader`
- Em cada `DRERow` e `GroupRow`, calcular e exibir a soma de todos os valores
- Na `GroupRow`: somar o array `values`
- Na `DRERow`: somar o array `values`
- Para linhas de margem (%), exibir a média ponderada ou o total calculado
- Estilizar a coluna Total com fundo destacado (`bg-primary/5` ou similar)

## 3. Gráfico "Retorno Acumulado" — botão para alternar entre Receita Bruta e Lucro Líquido

**Arquivo:** `src/components/simulator/SectionCharts.tsx`

- Adicionar estado local `retornoMetrica: 'resultadoFinal' | 'receitaBrutaTotal'`
- Dois botões (toggle/tabs): "Lucro Líquido" e "Receita Bruta"
- Recalcular `retornoData` com base na métrica selecionada:
  - `resultadoFinal`: soma acumulada do resultado final (como está hoje)
  - `receitaBrutaTotal`: soma acumulada da receita bruta
- Atualizar label da linha no gráfico conforme seleção

## 4. Gráfico "Evolução das Linhas do DRE" — 5 legendas mas só 3 linhas + tooltip com %

**Arquivo:** `src/components/simulator/SectionCharts.tsx`

- O problema é provavelmente que "Resultado Líquido" e "Resultado Final" têm valores muito próximos (ou negativos próximos de zero), ficando sobrepostos e invisíveis contra o eixo
- Verificar se os dados `dreLines` estão corretos e se todas as 5 propriedades existem
- Possível fix: ajustar o domínio do YAxis com `domain={['auto', 'auto']}` para incluir valores negativos
- Adicionar `connectNulls` e garantir que nenhum valor é undefined/NaN

**Tooltip com %:**
- Customizar o `formatter` do Tooltip para mostrar valor + % sobre receita bruta
- Ex.: `R$ 15.000 (25,3%)` — onde % = valor / receita bruta do mesmo mês
- Criar um custom tooltip ou usar o `formatter` com acesso ao payload para calcular a % relativa

## Arquivos Modificados
- `src/components/simulator/SectionPL.tsx` — scroll fix, coluna Total
- `src/components/simulator/SectionCharts.tsx` — toggle retorno, fix 5 linhas DRE, tooltip com %
