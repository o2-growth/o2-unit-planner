

## Plano: Adicionar glossário explicativo na página MRR do PDF

### Problema
A página "Evolução MRR e Base de Clientes" do PDF não explica de onde vêm os números, gerando dúvidas sobre a base de cálculo de cada coluna.

### Solução

**Arquivo:** `src/lib/exportPdf.ts` — função `drawMRRPage` (linhas 434-490)

Após a tabela autoTable, adicionar um bloco de notas explicativas (footnotes) com as definições de cada coluna:

1. Capturar o `finalY` da tabela (como já feito na DRE)
2. Desenhar um bloco de texto com as seguintes definições:

- **MRR CAAS** — Receita recorrente mensal de CFO as a Service: inclui MRR próprio (vendas da unidade) + receita pré-existente da carteira inicial, líquido de churn.
- **MRR SAAS** — Receita recorrente do OXY+GENIO reconhecida pela franquia: corresponde a {revenueShareSaaS}% de revenue share sobre o faturamento SAAS (não os 100%), líquido de churn.
- **MRR Matriz** — MRR gerado por clientes adquiridos via inbound da matriz, acumulado e líquido de churn.
- **MRR Total** — Soma de MRR CAAS + MRR SAAS + MRR Matriz + Receita Pré-existente.
- **Churn R$** — Valor monetário da perda mensal de receita recorrente, aplicando a taxa de churn sobre o MRR total do período anterior.
- **Clientes Mês** — Quantidade de novos clientes adquiridos no período: vendas próprias da unidade + clientes comprados da matriz.
- **Clientes Acum.** — Base acumulada de clientes ativos ao final do período.
- **Setup Matriz** — Receita pontual de implantação dos clientes adquiridos via matriz (clientes × ticket de setup).

O bloco será renderizado em fonte 6.5, cor `MUTED`, com bullet points verdes, abaixo da tabela. Também incluir uma nota dinâmica com o % de revenue share configurado (ex: "30%").

