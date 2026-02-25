

# PDF com agrupamento automatico + Excel completo e bonito

## Problema
1. **PDF**: Com horizontes > 12 meses (18, 24, 36, 48, 60), as colunas ficam estreitas demais e os numeros quebram em duas linhas
2. **Excel**: Atualmente exporta apenas 10 campos basicos em uma unica aba, sem formatacao

## Solucao

### 1. PDF — Agrupamento automatico por horizonte

Nova funcao `groupProjections(projections, horizonte)` que agrupa os dados conforme o numero de meses:

```text
Horizonte    Agrupamento    Colunas no PDF
─────────    ───────────    ──────────────
≤ 12         Mensal         12 + Total = 13
13-24        Trimestral     6-8 + Total
25-48        Semestral      5-8 + Total
49-60        Anual          5 + Total
```

Valores monetarios sao somados no agrupamento; percentuais sao recalculados (media ponderada). Headers mudam para "Tri 1", "Sem 1", "Ano 1" etc.

Adicionalmente:
- Criar `formatCurrencyCompact(value)` em `formatters.ts` — omite centavos quando |value| >= 10000
- Reduzir fontSize para 5pt, cellPadding para 0.8, margens para 10
- Adicionar `overflow: 'ellipsize'` como seguranca extra
- Aplicar mesma logica de agrupamento na tabela MRR

### 2. Excel — 3 abas completas com formatacao

Reescrever `handleExportExcel` em `ActionButtons.tsx` para gerar um Excel profissional com 3 abas:

**Aba 1 — DRE Gerencial** (dados mensais completos, sem agrupamento):
- Todas as linhas da DRE (receita bruta, deducoes, custos variaveis, despesas fixas, EBITDA, resultado final)
- Coluna por mes + coluna Total
- Headers em negrito com fundo verde escuro
- Linhas de subtotal com fundo verde claro
- Numeros negativos em vermelho
- Formato de moeda brasileiro nas celulas numericas
- Largura de colunas ajustada

**Aba 2 — MRR e Clientes** (dados mensais completos):
- MRR CAAS, SAAS, Matriz, Total
- Churn em R$
- Clientes por mes e acumulado
- Setup Matriz
- Mesma formatacao visual

**Aba 3 — ROI e Investimento**:
- Quadro de investimento (taxa franquia, implantacao, marketing, equipamentos, outros, capital de giro, total)
- Indicadores de retorno (ROI direto, ROI total, payback)
- Premissas principais

### Arquivos alterados

1. **`src/lib/formatters.ts`** — Adicionar `formatCurrencyCompact`
2. **`src/lib/exportPdf.ts`** — Adicionar `groupProjections`, atualizar `buildDRERows` para usar dados agrupados, atualizar `drawDREPage` e `drawMRRPage` com novos estilos
3. **`src/components/simulator/ActionButtons.tsx`** — Reescrever `handleExportExcel` com 3 abas formatadas usando xlsx cell styles

### Detalhes tecnicos do Excel

A biblioteca `xlsx` (SheetJS) suporta estilos limitados na versao community. Para contornar:
- Usar `XLSX.utils.aoa_to_sheet` para controle total do layout (array de arrays)
- Definir larguras de coluna com `ws['!cols']`
- Merge de celulas para headers com `ws['!merges']`
- Formato numerico `#,##0.00` nas celulas de valor

