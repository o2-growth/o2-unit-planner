

# Adicionar Tooltips Explicativos em Todas as Linhas do DRE

## Escopo

Adicionar tooltips com a base de cálculo em **todas** as linhas do DRE — tanto nas linhas principais (GroupRow) quanto nas linhas de drilldown (DRERow) — explicando de onde vem cada número e como é calculado.

## Alterações: `src/components/simulator/SectionPL.tsx`

### 1. Atualizar `GroupRow` para aceitar `tooltip`
- Adicionar prop `tooltip?: string` ao `GroupRow`
- Renderizar `LabelWithTooltip` quando tooltip existir

### 2. Expandir `CATEGORY_TOOLTIPS` para um mapa completo de todas as linhas

**Linhas principais (GroupRow):**
- `= RECEITA BRUTA` → "Soma de todas as fontes: CAAS + SAAS/Setup + Education + Expansão + Tax"
- `(-) Deduções de Vendas` → "PIS + COFINS + ISSQN + ICMS aplicados conforme alíquota por produto (Seção 8)"
- `(-) Custos Variáveis` → "Soma dos custos variáveis (% sobre receita de cada produto, configurados na Seção 9)"
- `(-) Despesas Fixas` → "Marketing + Comerciais + Pessoal + Administrativas (% sobre receita bruta)"
- `Abaixo do Resultado Operacional` → "Receitas Financeiras - Despesas Financeiras - IRPJ/CSLL"

**Linhas de drilldown (DRERow) — Receita:**
- `CAAS` → já tem tooltip, manter
- `SAAS + Setup` → já tem, manter
- `Education`, `Expansão`, `Tax` → já têm, manter

**Drilldown — Deduções:**
- `PIS` → "Alíquota de PIS aplicada sobre receita de cada produto conforme configuração da Seção 8"
- `COFINS` → idem para COFINS
- `ISSQN` → idem para ISSQN
- `ICMS` → idem para ICMS

**Drilldown — Custos Variáveis:**
- `Custos CAAS` → "25% sobre receita bruta de CAAS"
- `Custos SAAS` → "% configurado sobre receita bruta de SAAS"
- `Custos Education` → "% sobre receita de Education"
- `Custos CS` → "% sobre receita bruta total (mínimo 2% quando receita > R$500k)"
- `Custos Expansão` → "% sobre receita de Expansão"
- `Custos Tax` → "% sobre receita de Tax"

**Drilldown — Despesas Fixas:**
- `Marketing` → "7,5% sobre receita bruta ou CAC total da Matriz (o maior valor)"
- `Comerciais` → "7,5% sobre receita bruta total"
- `Pessoal` → "Pró-labore definido na Seção 3 (valor mês 1-12 / após 12)"
- `Administrativas` → "R$6.000 fixo até R$100k de receita, depois % sobre receita bruta"

**Linhas de resultado e margens:**
- `(-) Royalties` → "20% sobre receita bruta total — repasse obrigatório à franqueadora"
- `= RECEITA LÍQUIDA` → "Receita Bruta - Deduções (impostos) - Royalties"
- `= MARGEM DE CONTRIBUIÇÃO` → "Receita Líquida - Custos Variáveis"
- `Margem Bruta` → "Margem de Contribuição ÷ Receita Bruta × 100"
- `= RESULTADO OPERACIONAL` → "Margem de Contribuição - Despesas Fixas"
- `Margem Operacional` → "Resultado Operacional ÷ Receita Bruta × 100"
- `+ Receitas Financeiras` → "% sobre receita bruta (configurado na Seção 9)"
- `- Despesas Financeiras` → "% sobre receita bruta (configurado na Seção 9)"
- `- IRPJ/CSLL` → "Calculado sobre receita por produto quando resultado operacional > 0"
- `= RESULTADO LÍQUIDO` → "Resultado Operacional + Rec. Financeiras - Desp. Financeiras - IRPJ/CSLL"
- `Margem Líquida` → "Resultado Líquido ÷ Receita Bruta × 100"
- `(-) Amortização` → "Parcela mensal fixa de empréstimo (PMT configurado na Seção 9)"
- `(-) Investimentos` → "Investimentos mensais em ativos (configurado na Seção 9)"
- `= RESULTADO FINAL` → "Resultado Líquido - Amortização - Investimentos (- Pró-labore se modo distribuição)"
- `Margem Final` → "Resultado Final ÷ Receita Bruta × 100"

### 3. Implementação técnica
- Criar um dicionário `LINE_TOOLTIPS` com todas as tooltips acima
- Passar `tooltip` para cada `DRERow` e `GroupRow` usando o dicionário
- Adicionar tooltip à linha de RECEITA LÍQUIDA (que é um `TableRow` customizado)
- O componente `LabelWithTooltip` já existe e será reutilizado

