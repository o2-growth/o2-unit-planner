

## Plano: Reformular página Resumo Executivo do PDF

### Problema
A página 2 do PDF (Resumo Executivo) precisa de mais detalhamento: período simulado no título, KPIs diferentes, premissas de vendas separadas (unidade/matriz/total), tickets médios por produto e explicação das principais premissas do P&L.

### Alterações — `src/lib/exportPdf.ts`, função `drawExecutiveSummary` (linhas 265-359)

#### 1. Título com período
```
'Resumo Executivo — Período: {horizonte} meses'
```

#### 2. KPI Cards (6 widgets, layout 3×2)
Substituir os atuais por:
- **Receita Bruta Total**
- **Lucro Bruto** (novo, substitui Receita Líquida)
- **EBITDA Total**
- **Lucro Líquido** (novo, substitui Resultado Final — usar `resultadoLiquido`)
- **Payback**
- **ROI Total**

#### 3. Premissas — reestruturar em 3 blocos

**Bloco "Vendas":**
- Vendas Unidade: `mix.caas + mix.saas + mix.diagnostico` /mês
- Vendas Matriz: `matrixClients.qtdMensalInicial` /mês
- Vendas Total mensal: soma

**Bloco "Tickets Médios":**
- Ticket CAAS: valor
- Ticket SAAS: valor
- Ticket Setup: valor
- Ticket Diagnóstico Estratégico: valor

**Bloco "Principais Premissas P&L"** (texto descritivo com bullets):
- Receita CAAS: 100% Unidade
- Receita SAAS: {revenueShareSaaS}% de revenue share vindo da matriz
- Royalties: {royalties}% sobre receita bruta (exceto SAAS que já vem do revenue share)
- Deduções: cálculo automático de acordo com regime tributário, produto e nível de faturamento
- Custo variável CAAS: 25% da receita bruta (time de atendimento; começando com custo do sócio — pró-labore definido na simulação ou 25%, o que for maior)
- Marketing: 5% ou custo de CAC, o que for maior
- Comercial: 5% ou pró-labore sócio comercial, o que for maior
- Administrativo: 5%
- Despesa financeira: 1%
- Amortização dívida: se tiver (condicional)
- Investimentos: se tiver (condicional)

#### 4. Indicador de Payback
Manter barra visual existente abaixo dos blocos.

#### 5. Layout
A página ficará mais densa. Usaremos fonte menor (6-7pt) para as premissas P&L, organizadas em coluna única com bullets verdes. KPIs mantêm o grid 3×2. Os 3 blocos de premissas usam layout em colunas para vendas/tickets e full-width para premissas P&L.

### Arquivos afetados
- `src/lib/exportPdf.ts` — função `drawExecutiveSummary`

