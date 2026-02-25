

# PDF Premium — Documento que Encanta o Cliente

## Visao Geral

Transformar o PDF de um simples relatório tabelar em um documento executivo de apresentacao comercial com **5 paginas** que encante o franqueado. O layout atual (tabela DRE + MRR) sera mantido mas complementado com paginas visuais de alto impacto.

## Estrutura do PDF (5 paginas)

### Pagina 1 — Capa

- Fundo escuro (`[20, 25, 30]`) com retangulo verde decorativo lateral
- Logo O2 grande centralizado (~80mm largura)
- Titulo: "Plano Financeiro" em fonte 28pt branca
- Subtitulo: Nome do franqueado em 18pt verde
- Data de geracao e horizonte em texto discreto na parte inferior
- Linha verde fina decorativa separando elementos

### Pagina 2 — Resumo Executivo (KPIs visuais)

- Header com logo pequeno + titulo "Resumo Executivo"
- **6 cards de KPI** dispostos em grid 3x2 com caixas coloridas:
  - Receita Bruta Total (verde)
  - Receita Liquida (verde)
  - EBITDA Total (verde)
  - Resultado Final (verde ou vermelho se negativo)
  - Payback (meses)
  - ROI Total (%)
- Cada card: retangulo arredondado com fundo claro, valor grande em negrito, label pequeno abaixo
- **Bloco de premissas** abaixo dos KPIs em 2 colunas com icones representados por circulos verdes:
  - Vendas/mes, Tickets, Churn, Royalties, Investimento, Pro-labore
- **Indicador de Payback**: barra horizontal visual mostrando meta vs projetado

### Pagina 3 — DRE Gerencial Completa (tabela existente)

- Mantem a tabela DRE completa ja implementada
- Header com logo + titulo "DRE Gerencial"
- Mesma formatacao com subtotais, resultados destacados, negativos em vermelho

### Pagina 4 — Evolucao MRR e Clientes (tabela existente)

- Mantem a tabela MRR ja implementada
- Header com logo + titulo "Evolucao MRR e Base de Clientes"

### Pagina 5 — ROI e Payback

- Header com logo + titulo "Analise de Retorno"
- **Quadro de investimento** detalhado:
  - Taxa de franquia, Implantacao, Marketing, Equipamentos, Outros
  - Capital de giro sugerido
  - **Investimento Total** em destaque
- **Quadro de retorno** lado a lado:
  - ROI Direto e ROI Total com valores grandes
  - Payback em meses
  - Indicador visual: circulo verde (atingiu meta) ou vermelho (nao atingiu)
- Mensagem final: "Simulacao gerada por O2 Inc. | Este documento e uma projecao..."

### Rodape em todas as paginas

- "O2 Inc. Simulador Financeiro" + data/hora + numero de pagina
- Linha verde fina acima do rodape

## Mudancas Tecnicas

### Arquivo: `src/lib/exportPdf.ts`

Reescrita completa da funcao `exportPDF` com:

1. **Funcao `drawCoverPage(doc, state)`** — Desenha a capa com fundo escuro, logo grande, titulo, nome
2. **Funcao `drawExecutiveSummary(doc, state, projections, investment)`** — KPI cards como retangulos com `doc.roundedRect()`, valores formatados grandes, premissas em grid
3. **Funcao `drawPageHeader(doc, logo, title)`** — Header reutilizavel (logo pequeno + titulo + linha verde) para paginas 2-5
4. **Funcao `drawROIPage(doc, state, projections)`** — Investimento detalhado + quadro de retorno com `calculateROI()`
5. Manter funcoes existentes: `buildDRERows`, `loadLogoAsDataUrl`, `sumField`, `avgField`
6. Manter as tabelas autoTable existentes (DRE e MRR)

### Tecnicas visuais com jsPDF puro (sem dependencias extras)

- `doc.setFillColor()` + `doc.rect()` para backgrounds de cards e capa
- `doc.roundedRect()` para cards com cantos arredondados
- `doc.setFontSize()` variando entre 7pt (detalhes) ate 28pt (titulo capa)
- Cores: verde O2 `[110, 222, 64]` (do logo), verde escuro `[30, 120, 60]`, fundo escuro `[20, 25, 30]`, branco
- `doc.line()` para separadores decorativos

### Nenhum arquivo adicional necessario

Toda a logica fica em `src/lib/exportPdf.ts`. O `ActionButtons.tsx` permanece inalterado.

