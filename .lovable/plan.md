
# Ajustes do Simulador Financeiro O2 Inc. -- Iteracao 2

## Resumo das Mudancas

10 ajustes principais: logica do mix de vendas (SETUP automatico), simplificacao do churn, cabecalho editavel no DRE, controle admin para regras sensiveis, padronizacao "SAAS", taxa de franquia com cupom, graficos de resultados, e revisao de consistencia.

---

## 1. Mix de Vendas -- SETUP Automatico

**Arquivo:** `src/types/simulator.ts`, `src/components/simulator/SectionCommercial.tsx`, `src/lib/financial.ts`

- Remover `setup` do `SalesMix` (fica apenas `caas`, `saas`, `diagnostico`)
- O campo `compromissoMensal` passa a ser a soma de CAAS + SAAS + Diagnostico
- Exibir campo calculado read-only: "SETUP gerado automaticamente = CAAS + SAAS"
- Adicionar aviso visual: "SETUP e obrigatorio na contratacao de CAAS e/ou SAAS e sera calculado automaticamente"
- Na logica financeira, receita de SETUP = (mix.caas + mix.saas) x ticket de Setup
- Manter ticket de Setup editavel (ele continua existindo como produto, so nao entra no mix manual)

## 2. Churn -- Simplificar Exibicao

**Arquivo:** `src/components/simulator/SectionChurn.tsx`

- Remover a tabela detalhada de churn (base inicial, churn R$, novo MRR, base final)
- Manter apenas o campo de input do churn mensal (%) com uma descricao simples
- A logica de churn continua identica no `financial.ts` -- apenas a exibicao muda
- Resultado do churn aparece no DRE e nos graficos

## 3. Cabecalho Editavel de Premissas no DRE

**Arquivo:** Novo componente `src/components/simulator/PremissasHeader.tsx`, ajuste em `src/pages/Index.tsx`

- Criar componente com grid de campos editaveis das premissas-chave:
  - Horizonte de projecao
  - Qtd CAAS/mes, SAAS/mes, Diagnostico/mes
  - Tickets (CAAS, SAAS, Diagnostico, Setup)
  - Churn MRR (%)
  - Clientes comprados da Matriz (mes 1) e crescimento
  - CAC simbolico
  - Pro-labore alvo
- Posicionado logo acima da secao P&L/DRE
- Alteracoes neste cabecalho propagam para o state central e recalculam tudo

## 4. Controle Admin -- Revenue Share e Royalties

**Arquivos:** Novo `src/contexts/AuthContext.tsx`, novo `src/components/simulator/AdminLogin.tsx`, ajustes em `SectionRevenueRules.tsx`

- Criar contexto de autenticacao simples (sem Supabase nesta versao):
  - Estado: `isAdmin: boolean`
  - Login com senha fixa armazenada em variavel (nao localStorage)
  - Credencial admin: usuario `admin`, senha `o2admin2024`
- Botao "Admin" no header da pagina que abre dialog de login
- Na secao de Regras Comerciais:
  - Revenue Share SAAS (30%) e Royalties (20%) aparecem como read-only para usuario comum
  - Se `isAdmin === true`, campos ficam editaveis
  - Badge "Somente Admin" nos campos travados

## 5. Padronizacao "SAAS" em Maiusculo

**Todos os arquivos** com ocorrencias de "SaaS" ou "saas" em labels/textos visíveis:

- `SectionCommercial.tsx`: label "SAAS"
- `SectionRevenueRules.tsx`: "SAAS"
- `SectionPL.tsx`: "SAAS" na DRE
- `SectionResults.tsx`: labels
- `SectionChurn.tsx`: se houver
- `simulator.ts`: nome do ticket "SAAS", labels de custos
- Manter as keys internas como `saas` (lowercase) para nao quebrar logica

## 6. Taxa de Franquia Padrao + Cupom

**Arquivos:** `src/types/simulator.ts`, `src/components/simulator/SectionROI.tsx`

- Valor padrao de `taxaFranquia` no INITIAL_STATE: `190000`
- Adicionar campo `cupom` e `cupomAplicado` ao `InvestmentData`
- Na UI do ROI:
  - Campo de cupom (texto) + botao "Aplicar Cupom"
  - Se cupom === "FRANQUIAOURO": taxa = 140.000, feedback verde com check
  - Se cupom invalido: feedback vermelho, mantem 190.000
  - Exibir: taxa original, desconto aplicado, taxa final
- Campo de taxa de franquia read-only para usuario comum (editavel apenas admin, opcional)

## 7. Graficos de Resultados

**Arquivo:** Novo `src/components/simulator/SectionCharts.tsx`, usar Recharts (ja instalado)

5 graficos principais:

1. **Retorno Acumulado vs Investimento Inicial** -- LineChart
   - Linha: resultado final acumulado mes a mes
   - Linha horizontal: investimento total
   - Ponto de cruzamento destacado (payback)

2. **Resultado Mensal** -- BarChart
   - Barras do resultado final (ou EBITDA) por mes
   - Cores: verde para positivo, vermelho para negativo

3. **Evolucao Receita e MRR** -- LineChart
   - Linha receita total
   - Linha MRR final
   - (opcional) linha de churn R$ discreta

4. **Composicao de Receita por Produto** -- AreaChart empilhado
   - CAAS, SAAS, Setup, Diagnostico/Expansao ao longo dos meses

5. **Payback Highlight** -- Card KPI
   - Mes do payback em destaque
   - Retorno acumulado no fim do periodo
   - ROI no horizonte

Posicionados na Secao 12 (Resultados), acima ou abaixo dos KPIs.

## 8. Revisao de Consistencia da Modelagem

**Arquivo:** `src/lib/financial.ts`

- Ajustar calculo de receita Setup: `(mix.caas + mix.saas) * ticketSetup` (automatico)
- Remover `mix.setup` da logica
- Garantir que churn reflete corretamente no DRE
- Revenue share SAAS fixo em 30% (ler do state, mas UI travada)
- Royalties fixo em 20% (idem)
- Taxa de franquia padrao 190.000 no calculo de ROI
- Recalculo completo funciona ao alterar qualquer premissa (ja funciona via useMemo)

## 9. Ordem Visual Ajustada

Manter one-page vertical. Ordem final:
1. Header + botoes de acao
2. Perfil do Socio
3. Mensagem de transicao
4. Objetivos
5. Mensagem "Bora para os numeros"
6. Horizonte
7. Premissas Comerciais (mix sem setup manual)
8. Clientes Matriz
9. Churn (simplificado, so input)
10. Impostos
11. Regras Comerciais (admin-only para rev share/royalties)
12. **Cabecalho de Premissas Editavel** (novo)
13. P&L / DRE
14. ROI e Payback (com cupom)
15. **Graficos** (novo)
16. Resultados / KPIs
17. Botoes de acao (rodape)

---

## Detalhes Tecnicos

- **Auth simples:** Context + Dialog, sem backend. Senha hardcoded no codigo (versao MVP). Estrutura preparada para evoluir para Supabase.
- **Graficos:** Recharts (ja instalado). ResponsiveContainer para responsividade.
- **Cupom:** Validacao client-side. Cupom valido: "FRANQUIAOURO".
- **Persistencia:** localStorage continua funcionando com novo schema (backward-compatible com fallback para INITIAL_STATE).

## Arquivos Criados
- `src/contexts/AuthContext.tsx`
- `src/components/simulator/AdminLogin.tsx`
- `src/components/simulator/PremissasHeader.tsx`
- `src/components/simulator/SectionCharts.tsx`

## Arquivos Modificados
- `src/types/simulator.ts`
- `src/lib/financial.ts`
- `src/pages/Index.tsx`
- `src/components/simulator/SectionCommercial.tsx`
- `src/components/simulator/SectionChurn.tsx`
- `src/components/simulator/SectionRevenueRules.tsx`
- `src/components/simulator/SectionROI.tsx`
- `src/components/simulator/SectionPL.tsx`
- `src/components/simulator/SectionResults.tsx`
- `src/App.tsx`
