

# Melhorar PDF Exportado com DRE Completa e Design O2

## Resumo
Reescrever a função `handleExportPDF` em `ActionButtons.tsx` para gerar um PDF profissional com logotipo da O2, design com a paleta verde/preto da marca, e a DRE gerencial completa (espelhando a tabela da seção 9).

## Mudanças Técnicas

### `src/components/simulator/ActionButtons.tsx` - função `handleExportPDF`

**1. Header com logotipo e branding**
- Carregar o SVG `/logo-o2-color.svg` como imagem (fetch + conversão para base64 data URL)
- Posicionar o logo no canto superior esquerdo (aprox. 30x15mm)
- Título "Simulador Financeiro - O2 Inc." ao lado do logo com fonte maior
- Subtítulo com nome do franqueado, data de geração, e horizonte
- Linha separadora verde abaixo do header

**2. Premissas resumidas (mini-seção antes da tabela)**
- Bloco com informações-chave: compromisso mensal de vendas, churn, pró-labore, tickets, royalties, regime tributário
- Exibido em 2 colunas de texto compacto

**3. Tabela DRE completa (substituindo a tabela resumida atual)**
A tabela terá todas as linhas do DRE gerencial, replicando a estrutura da seção 9:

| Linha | Mês 1 | Mês 2 | ... | Total |
|---|---|---|---|---|
| = RECEITA BRUTA | | | | |
|   CAAS | | | | |
|   SAAS + Setup | | | | |
|   Education | | | | |
|   Expansão | | | | |
|   Tax | | | | |
| (-) Deduções | | | | |
|   PIS / COFINS / ISSQN / ICMS | | | | |
| (-) Royalties (20%) | | | | |
| = RECEITA LÍQUIDA | | | | |
| (-) Custos Variáveis | | | | |
|   (detalhamento) | | | | |
| = MARGEM DE CONTRIBUIÇÃO | | | | |
|   Margem Bruta % | | | | |
| (-) Despesas Fixas | | | | |
|   (detalhamento) | | | | |
| = RESULTADO OPERACIONAL | | | | |
|   Margem Operacional % | | | | |
| + Rec. Financeiras | | | | |
| - Desp. Financeiras | | | | |
| - IRPJ/CSLL | | | | |
| = RESULTADO LÍQUIDO | | | | |
| (-) Amortização | | | | |
| (-) Investimentos | | | | |
| = RESULTADO FINAL | | | | |

**4. Estilo da tabela**
- Header verde escuro (`[30, 120, 60]`) com texto branco
- Linhas de subtotal (Receita Bruta, Receita Líquida, Margem, EBITDA, Resultado Final) com fundo cinza claro e negrito
- Linhas de detalhe com fonte menor e indentação
- Valores negativos em vermelho
- Coluna "Total" com fundo levemente destacado
- Percentuais formatados com `formatPercent`

**5. Rodapé**
- Texto "Gerado por O2 Inc. Simulador Financeiro" + data/hora
- Número da página

**6. Segunda página: tabela de MRR e Clientes**
- Tabela adicional com colunas: Mês, MRR CAAS, MRR SAAS, MRR Matriz, MRR Total, Churn R$, Clientes Comprados, Clientes Acumulados

### Conversão do logo SVG
- Usar `fetch('/logo-o2-color.svg')` para obter o SVG
- Converter para data URL via `URL.createObjectURL` ou inline como SVG string
- jsPDF suporta SVG via `doc.addSvgAsImage()` ou converter para PNG via canvas; usaremos canvas para compatibilidade

