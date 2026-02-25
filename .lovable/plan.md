

# Excel Profissional com Identidade Visual O2

## Problema
O Excel exportado atualmente nao tem **nenhuma formatacao visual** — sem cores, sem negrito, sem bordas, sem identidade da marca O2. E apenas um dump de dados cru, sem valor de apresentacao.

A causa raiz: a biblioteca `xlsx` (SheetJS community) **nao suporta estilos de celula** (cores de fundo, fontes coloridas, negrito, bordas). Ela so suporta formato numerico e largura de coluna.

## Solucao

Substituir `xlsx` pela biblioteca **`exceljs`**, que tem suporte completo a estilos Excel:
- Cores de fundo (fill)
- Fonte (bold, color, size)
- Bordas
- Alinhamento
- Merge de celulas
- Freeze panes (congelar primeira coluna)

### Design Visual — Identidade O2

Cores baseadas na paleta O2 Inc.:

```text
Header principal     → Fundo verde escuro (#2D5A1B), texto branco, bold
Linhas de subtotal   → Fundo verde claro (#E8F5E0), texto escuro, bold
Linhas de resultado  → Fundo verde medio (#4CAF50), texto branco, bold
Linhas de detalhe    → Fundo branco, texto cinza escuro
Valores negativos    → Fonte vermelha (#D32F2F)
Percentuais          → Formato 0.00%
Titulo de secao ROI  → Merge de celulas, fundo escuro, texto branco
```

### Funcionalidades por Aba

**Aba 1 — DRE Gerencial:**
- Header com logo conceitual (titulo "O2 INC — DRE Gerencial" em merge)
- Primeira linha de dados com fundo verde escuro e texto branco
- Linhas de subtotal (RECEITA BRUTA, DEDUCOES, etc.) com fundo verde claro e bold
- Linhas de resultado (RECEITA LIQUIDA, MARGEM, EBITDA, RESULTADO FINAL) com fundo verde medio e bold branco
- Freeze na coluna A (labels sempre visiveis ao scrollar)
- Bordas finas em todas as celulas
- Formato monetario `R$ #,##0.00` nas celulas de valor

**Aba 2 — MRR e Clientes:**
- Mesmo padrao visual
- Header verde escuro
- Linha "MRR Total" destacada como subtotal
- Freeze na coluna A

**Aba 3 — ROI e Investimento:**
- Secoes com titulos em merge (INVESTIMENTO DETALHADO, INDICADORES DE RETORNO, PREMISSAS)
- Cada titulo com fundo verde escuro
- Linha "INVESTIMENTO TOTAL" destacada
- Valores formatados adequadamente

### Mudancas Tecnicas

1. **`package.json`** — Substituir `xlsx` por `exceljs`
2. **`src/lib/exportExcel.ts`** — Reescrever completamente usando API do ExcelJS:
   - `ExcelJS.Workbook` para criar workbook
   - `worksheet.getCell()` para aplicar estilos individuais
   - `worksheet.mergeCells()` para titulos
   - `worksheet.views` para freeze panes
   - `workbook.xlsx.writeBuffer()` + `Blob` + download link para salvar
3. **`src/components/simulator/ActionButtons.tsx`** — Sem mudanca (ja chama `exportExcel`)

### Exemplo de codigo (ExcelJS)

```typescript
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('DRE Gerencial');

// Header row com estilo
const headerRow = ws.addRow(headerData);
headerRow.eachCell(cell => {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D5A1B' } };
  cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  cell.border = { /* thin borders */ };
});

// Freeze first column
ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
```

### Impacto
- Remover dependencia `xlsx` (~800KB)
- Adicionar dependencia `exceljs` (~1.2MB, mas com suporte completo a estilos)
- Nenhum outro arquivo afetado

