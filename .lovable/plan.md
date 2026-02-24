
# Correções Visuais no DRE e Gráficos

## Problemas Identificados

### 1. Scroll Horizontal Quebrado no DRE
O componente `Table` do shadcn/ui já cria um container com `overflow-auto` internamente (linha 7 do `table.tsx`). Porém, o `CardContent` pai também tem `overflow-x-auto`, criando **dois containers de scroll aninhados**. Isso quebra o comportamento do `sticky left-0` na primeira coluna, causando sobreposição.

**Correção:** Remover `overflow-x-auto` do `CardContent` (linha 139 de `SectionPL.tsx`), deixando apenas o scroll nativo do componente `Table`.

### 2. Coluna Total e Sticky Column
A coluna Total e o sticky column já estão implementados corretamente no código. Apenas o bug do double-scroll impede a visualização correta.

### 3. Toggle Receita/Lucro no Gráfico de Retorno
Já está implementado no `SectionCharts.tsx` com o estado `retornoMetrica` e dois botões de toggle. Funcionará corretamente quando houver dados de projeção.

### 4. Gráfico de Linhas do DRE — 5 Legendas / 3 Linhas Visíveis
Com dados zerados ou muito similares, as linhas de "Resultado Líquido" e "Resultado Final" ficam sobrepostas com as outras na linha zero. O `domain={['auto', 'auto']}` já está configurado, o que resolve quando há dados reais. Adicionalmente, usar `strokeDasharray` diferenciado em 2 das 5 linhas para distingui-las visualmente mesmo quando próximas.

## Detalhes Técnicos

### Arquivo: `src/components/simulator/SectionPL.tsx`
- **Linha 139:** Alterar `className="pt-4 overflow-x-auto"` para `className="pt-4"` (remover overflow duplicado)

### Arquivo: `src/components/simulator/SectionCharts.tsx`
- Adicionar `strokeDasharray` nas linhas de "Resultado Líquido" e "Resultado Final" para diferenciá-las visualmente quando sobrepostas
- Isso garante que todas as 5 linhas sejam distinguíveis mesmo com valores próximos

### Arquivos modificados
- `src/components/simulator/SectionPL.tsx` — remover overflow duplicado
- `src/components/simulator/SectionCharts.tsx` — diferenciar visualmente linhas sobrepostas
