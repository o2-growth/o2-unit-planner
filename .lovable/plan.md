## Objetivo

Garantir que o PDF exportado **sempre** apresente as projeções (DRE, MRR, etc.) **mês a mês**, independente do horizonte da simulação (12, 24, 36, 60+ meses). Hoje o PDF agrupa em trimestre/semestre/ano quando o horizonte passa de 12 meses.

## Mudanças

### 1. `src/lib/exportPdf.ts` — remover agrupamento

- Simplificar `groupProjections` para **sempre** retornar 1 grupo por mês:
  - `headers`: `['Mês 1', 'Mês 2', …, 'Mês N']`
  - `groups`: `[[p1], [p2], …, [pN]]`
- Remover blocos `if (horizonte <= 24)` / `<= 48` / `else` que definem `groupSize` 3/6/12.
- Remover a nota de rodapé `groupNote` ("Dados agrupados trimestralmente/semestralmente/anualmente") que aparece abaixo das tabelas — não fará mais sentido.

### 2. Layout para caber tudo

Como uma tabela com 24, 36 ou 60 colunas mensais não cabe em A4 retrato, ajustar a renderização:

- Mudar a página da tabela DRE/MRR para **A4 paisagem** (`orientation: 'landscape'`) ou usar **múltiplas páginas** quebrando a cada N meses (ex.: blocos de 12 meses repetindo a coluna "Conta" à esquerda).
- Reduzir `fontSize` da tabela dinamicamente conforme o nº de meses (ex.: 7pt até 12 meses, 6pt até 24, 5pt acima).
- Garantir coluna "Total" sempre na última posição.

**Recomendação:** quebrar em blocos de 12 meses por página em paisagem (Ano 1, Ano 2, Ano 3…), repetindo o cabeçalho de contas. Mantém legibilidade e não trunca dados.

### 3. Validação

- Gerar PDF com horizontes de 12, 24, 36 e 60 meses.
- Conferir visualmente (converter páginas em imagem) que:
  - Todas as colunas são `Mês X`, nunca `Tri/Sem/Ano`.
  - Nenhum texto está cortado.
  - A coluna "Total" aparece corretamente ao final.

## Pergunta antes de implementar

Prefere qual estratégia de layout para horizontes longos?
1. **Paisagem + blocos de 12 meses por página** (recomendado, sempre legível).
2. **Paisagem única com fonte reduzida** (uma tabela só, mas fica apertado em 36+ meses).
3. **Retrato com fonte minúscula** (vai ficar muito pequeno acima de 18 meses, não recomendo).
