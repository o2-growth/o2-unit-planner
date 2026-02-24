
# Iteracao 3 — Ajustes de Logica Financeira, DRE e ROI

## Resumo

Correcoes profundas na logica financeira (receita recorrente vs pontual, prolabore, custos em %), reestruturacao do DRE com group/ungroup, capital de giro como resultado, ROI direto vs total, e grafico de linhas do DRE.

---

## 1. Receita Mensal do Perfil vai para Receita Bruta do Mes 1

**Arquivo:** `src/lib/financial.ts`

- No mes 1, somar `state.profile.receitaMensal` a receita bruta total como receita pre-existente
- Adicionar campo `receitaPreExistente` no `MonthlyProjection` ou somar direto em `rbCaas` (ou linha propria)
- Essa receita aparece apenas no mes 1 (carteira atual do socio)

## 2. Pro-labore no DRE (Despesas com Pessoal)

**Arquivo:** `src/lib/financial.ts`

- Meses 1-12: `despPessoal = state.goals.proLaboreDesejado`
- Meses 13+: `despPessoal = state.goals.proLabore12m`
- Remover o campo editavel manual de "Despesas com Pessoal" dos `fixedCosts` — ele sera calculado automaticamente a partir das respostas do perfil/goals
- Exibir no DRE como linha separada

## 3. Logica de Receita Recorrente vs Pontual (Venda Propria)

**Arquivo:** `src/lib/financial.ts`

Corrigir a logica central de receita:

- **CAAS**: recorrente. Cada venda mensal de CAAS gera MRR que acumula nos meses seguintes. Receita = `ticketCaas * qtd` no mes + acumulado dos meses anteriores. 100% do franqueado.
- **SAAS**: recorrente. Cada venda gera MRR que acumula. Porem no DRE entra apenas 30% (revenue share). Receita reconhecida = `ticketSaas * 30% * qtd` + acumulado.
- **Setup**: pontual. Gerado automaticamente = (CAAS + SAAS) * ticketSetup. Nao acumula. Receita de setup vai para a **linha de SAAS no DRE** (conforme solicitado).
- **Diagnostico**: pontual. `ticketDiag * qtd` no mes, nao acumula.

Implementacao: rastrear `mrrCaasAcumulado` e `mrrSaasAcumulado` separadamente, aplicando churn sobre o MRR total acumulado.

## 4. Mix de Vendas — UX do Input

**Arquivo:** `src/components/simulator/SectionCommercial.tsx`

- Permitir digitar o numero livremente no campo (ja funciona com Input type=number)
- Tornar mais claro o indicador de soma: se ultrapassou, mostrar em vermelho "Excedeu X projetos do projetado"; se falta, "Faltam X projetos"
- Manter o Setup automatico como campo calculado read-only

## 5. Setup no DRE na Linha de SAAS

**Arquivo:** `src/lib/financial.ts`, `src/components/simulator/SectionPL.tsx`

- A receita de SETUP (venda propria) sera somada na linha de SAAS do DRE
- Remover linha separada de "Setup" do DRE (ou renomear para "SAAS + Setup")
- Setup da Matriz continua como esta (one-off de clientes comprados)

## 6. CAC no DRE

**Arquivo:** `src/lib/financial.ts`

- O custo de CAC (compra de clientes da Matriz) ja esta na variavel `cacTotal` e aparece como "CAC Matriz" na DRE. Confirmar que esta correto e visivel. (Ja esta implementado.)

## 7. Explicacao do Ticket de Clientes Comprados da Matriz

**Arquivo:** `src/components/simulator/SectionMatrixClients.tsx`

- Adicionar texto explicativo nos campos de "Setup por cliente comprado" e "MRR por cliente comprado":
  - "Este ticket esta mais relacionado ao minimo da matriz do que ao potencial da franquia, pois nascera do inbound sales da matriz."

## 8. Alinhamento Visual — Revenue Share e Royalties

**Arquivo:** `src/components/simulator/SectionRevenueRules.tsx`

- Alinhar os dois campos (Revenue Share SAAS e Royalties) em grid de 2 colunas com mesma altura e alinhamento
- Garantir que labels, badges e inputs fiquem na mesma posicao relativa

## 9. Premissas da Simulacao — Explicacao + Botao Resetar

**Arquivo:** `src/components/simulator/PremissasHeader.tsx`

- Adicionar texto: "Os numeros abaixo foram puxados das suas respostas anteriores, mas podem ser alterados diretamente aqui para fins de projecao do DRE."
- Adicionar botao "Restaurar Respostas Oficiais" que reseta as premissas para os valores das respostas do formulario (profile, goals, commercial original)
- Guardar os valores originais do formulario para poder restaurar

## 10. Custos e Despesas em % no DRE (Premissas Simplificadas)

**Arquivo:** `src/types/simulator.ts`, `src/lib/financial.ts`, `src/components/simulator/SectionPL.tsx`

Substituir os custos/despesas em R$ fixo por percentuais sobre receita bruta:

**Custos Variaveis (% sobre receita do respectivo produto):**
- Custos CAAS: 25%
- Custos SAAS: 0% (receita ja e so o revenue share de 30%)
- Custos Education: 0%
- Custos CS: 0% (ate 500k/mes de receita), 2% a partir de 500k
- Custos Expansao: 0%
- Custos Tax: 0%

**Despesas (% sobre receita bruta):**
- Marketing: 7,5%
- Comerciais: 7,5%
- Pessoal: prolabore (valor fixo vindo das goals, nao %)
- Administrativas: ate 100k de faturamento = R$ 6.000 fixo; a partir de 100k = 6% da receita

Mudar `variableCostRates` e `fixedCosts` de `valorMensal: number` para `percentual: number` (ou `tipo: 'percentual' | 'fixo'`), e calcular dinamicamente.

Exibir no formulario de premissas do DRE de forma simples (formato lista com % editavel).

## 11. DRE — Group/Ungroup (Expandir/Recolher Categorias)

**Arquivo:** `src/components/simulator/SectionPL.tsx`

- Adicionar Collapsible para cada grupo do DRE:
  - Receita Bruta (expandir para ver CAAS, SAAS, Education, Expansao, Tax)
  - Deducoes (expandir para ver cada imposto, exceto IRPJ/CSLL que ficam pos-EBITDA)
  - Custos Variaveis (expandir para ver cada custo)
  - Despesas Fixas (expandir para ver cada despesa)
  - Abaixo do EBITDA (expandir)
- Subtotais sempre visiveis; detalhes colapsaveis
- Usar Collapsible do shadcn ou estado local de toggle

## 12. Deducoes Abertas por Imposto (exceto IRPJ/CSLL)

**Arquivo:** `src/lib/financial.ts`, `src/components/simulator/SectionPL.tsx`

- Calcular e exibir cada imposto separadamente na DRE (PIS, COFINS, ISSQN, ICMS)
- IRPJ e CSLL saem das deducoes e vao para pos-EBITDA (antes do resultado liquido)
- Adicionar campos `deducaoPIS`, `deducaoCOFINS`, etc. no `MonthlyProjection`
- Remover "Provisao IRPJ/CSLL" do `belowEbitda` — calcular automaticamente a partir das aliquotas da secao 8

## 13. Remover Campos Desnecessarios do Abaixo do EBITDA

**Arquivo:** `src/components/simulator/SectionPL.tsx`, `src/types/simulator.ts`

- Remover: "Despesas Nao Operacionais" e "Outras Receitas"
- Manter: Receitas Financeiras, Despesas Financeiras, IRPJ/CSLL (calculado), Amortizacao, Investimentos
- Manter espaco para % editavel nos campos restantes

## 14. Amortizacao e Investimentos Apos Resultado Liquido

**Arquivo:** `src/lib/financial.ts`, `src/components/simulator/SectionPL.tsx`

Confirmar a estrutura:
```
= EBITDA
+ Receitas Financeiras
- Despesas Financeiras
- IRPJ/CSLL
= RESULTADO LIQUIDO
- Amortizacao da Divida Global
- Investimentos
= RESULTADO FINAL
```
(Ja esta assim, apenas confirmar e garantir visualmente.)

## 15. Grafico de Linhas do DRE

**Arquivo:** `src/components/simulator/SectionCharts.tsx`

Adicionar novo grafico LineChart com as linhas:
- Receita Bruta
- Margem de Contribuicao (Lucro Bruto)
- EBITDA
- Resultado Liquido
- Resultado Final

Eixo X = meses, Eixo Y = R$. Cores distintas por linha com legenda.

## 16. Capital de Giro como Resultado (nao como input)

**Arquivo:** `src/components/simulator/SectionROI.tsx`, `src/lib/financial.ts`

- Capital de giro = prejuizo dos primeiros meses + implantacao + marketing inicial + equipamentos + outros
- Calcular o prejuizo acumulado dos meses negativos iniciais (ate o breakeven)
- Capital de giro passa a ser campo calculado (read-only), nao editavel
- Formula: `capitalGiro = somaResultadoNegativoMesesIniciais + implantacao + marketingInicial + equipamentos + outros`
- Exibir como resultado da soma no card de investimento

## 17. ROI Direto e ROI Total + Payback com 2 Casas Decimais

**Arquivo:** `src/lib/financial.ts`, `src/components/simulator/SectionROI.tsx`

**ROI Direto:** sobre a taxa de franquia apenas
- `roiDireto = resultadoAnual / taxaFranquia * 100`

**ROI Total:** sobre taxa de franquia + implantacao + marketing + equipamentos + outros
- `roiTotal = resultadoAnual / (taxaFranquia + implantacao + marketing + equipamentos + outros) * 100`

**Payback:** exibir com 2 casas decimais (ex.: 14,35 meses)
- Calcular payback fracionado: interpolar entre o mes anterior e posterior ao breakeven

## 18. Tooltips/Popups Explicativos nos Campos de Investimento

**Arquivo:** `src/components/simulator/SectionROI.tsx`

Adicionar popover/tooltip em cada campo de investimento com explicacao:

- **Marketing Inicial:** "Patrocinar eventos na regiao, fazer um coquetel de lancamento convidando clientes, prospects e parceiros."
- **Implantacao/Setup da Unidade:** "Reforma, pintura, manutencao do espaco fisico."
- **Equipamentos/Mobiliario:** "Mesa, cadeira, televisao, computadores, wifi, etc."
- **Outros Investimentos:** "Vinho, brinde, lojinha O2 Inc., etc."

Usar `HoverCard` ou `Popover` do shadcn (ja disponivel no projeto).

---

## Arquivos Criados
Nenhum novo arquivo.

## Arquivos Modificados
- `src/types/simulator.ts` — custos em %, novos campos de projecao (deducoes por imposto, MRR por produto)
- `src/lib/financial.ts` — logica de receita recorrente/pontual, custos em %, prolabore automatico, capital de giro calculado, ROI direto/total, payback fracionado, IRPJ/CSLL pos-EBITDA
- `src/components/simulator/SectionPL.tsx` — DRE com group/ungroup, deducoes abertas, custos em %, remover campos desnecessarios
- `src/components/simulator/SectionROI.tsx` — capital de giro calculado, ROI direto/total, payback 2 decimais, tooltips explicativos
- `src/components/simulator/SectionCommercial.tsx` — indicador de soma mais claro
- `src/components/simulator/SectionMatrixClients.tsx` — texto explicativo sobre ticket
- `src/components/simulator/SectionRevenueRules.tsx` — alinhamento visual
- `src/components/simulator/PremissasHeader.tsx` — explicacao + botao restaurar
- `src/components/simulator/SectionCharts.tsx` — grafico de linhas do DRE
- `src/pages/Index.tsx` — passar profile/goals para o calculo, ajustar props
