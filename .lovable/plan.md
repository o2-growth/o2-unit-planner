

# Mudanças solicitadas — 4 blocos

## 1. Novo campo "Custo total mensal dos funcionários"
- **`src/types/simulator.ts`**: Adicionar `custoFuncionarios: number` ao `ProfileData` e ao `INITIAL_STATE.profile`
- **`src/components/simulator/SectionProfile.tsx`**: Após o campo "Se sim, quantos?", adicionar um `CurrencyInput` com label "Qual o CUSTO TOTAL MENSAL destes funcionários?" (visível apenas quando `possuiFuncionarios === true`)

## 2. Alterar label do pró-labore 12m
- **`src/components/simulator/SectionGoals.tsx`**: Trocar o texto "Quanto você quer receber de pró-labore daqui 12 meses? (R$/mês)" para "Além do seu pró-labore, quanto você quer retirar mensalmente de distribuição de lucro daqui 12 meses? (R$/mês)"

## 3. Substituir "projetos" por "NOVOS CLIENTES"
- **`src/components/simulator/SectionCommercial.tsx`**:
  - Label: "quantos projetos por mês?" → "quantos NOVOS CLIENTES por mês?"
  - Indicadores do mix: "projetos" → "NOVOS CLIENTES" (Ex: "Excedeu X NOVOS CLIENTES", "Faltam X NOVOS CLIENTES")

## 4. Tooltips nas categorias do DRE + CAC como subcategoria de Marketing + sinal negativo

### 4a. Tooltips nas linhas do DRE expandido (SectionPL.tsx)
Adicionar tooltips inline (ícone Info com Tooltip) nas linhas de receita bruta:
- **CAAS**: "CFO as a Service"
- **SAAS**: "Plataforma OXY + GENIO — 30% de revenue share recorrente acumulando com churn"
- **SETUP**: "Produto pontual — vendas × ticket, não acumula"
- **Education**: "Cursos e formações que a franquia pode revender"
- **Expansão**: "Venda de Micro-Franquia"
- **Tax**: "Consultoria e Assessoria Tributária da Matriz — revenue share para o franqueado"

### 4b. Mover CAC Matriz de Custo Variável para subcategoria de Marketing
- **`src/lib/financial.ts`**: Remover `cacTotal` da soma de `custosVariaveisTotal`. Na lógica de `despMarketing`, comparar `marketing% × receita` vs `cacTotal` e usar o maior dos dois. Ou seja: `despMarketing = Math.max(receitaBrutaTotal * mktRate, cacTotal)`.
- **`src/components/simulator/SectionPL.tsx`**: Remover linha "CAC Matriz" dos custos variáveis expandidos. Dentro das despesas fixas expandidas, na linha Marketing, indicar que inclui CAC quando aplicável.
- **`src/types/simulator.ts`**: `MonthlyProjection` — adicionar campo `cacAbsorvido: boolean` para indicar se o CAC ultrapassou o % de marketing.

### 4c. Sinal negativo nos resultados
- **`src/components/simulator/SectionPL.tsx`**: Nas funções `DRERow` e `GroupRow`, quando o valor for negativo nas linhas de resultado (resultado líquido, resultado final), exibir `-R$ X` em vez de `R$ X`. Alterar `formatCurrency(Math.abs(v))` para exibir com sinal quando `v < 0`.
- **`src/components/simulator/SectionResults.tsx`**: Mesma lógica nos KPIs e tabelas — valores negativos com prefixo `-`.
- **`src/lib/formatters.ts`**: Criar `formatCurrencySigned(value)` que preserva o sinal negativo.

### Arquivos alterados
1. `src/types/simulator.ts` — ProfileData + MonthlyProjection + INITIAL_STATE
2. `src/components/simulator/SectionProfile.tsx` — novo campo custo funcionários
3. `src/components/simulator/SectionGoals.tsx` — label pró-labore
4. `src/components/simulator/SectionCommercial.tsx` — "NOVOS CLIENTES"
5. `src/lib/financial.ts` — CAC como subcategoria de marketing
6. `src/components/simulator/SectionPL.tsx` — tooltips, mover CAC, sinal negativo
7. `src/components/simulator/SectionResults.tsx` — sinal negativo
8. `src/lib/formatters.ts` — formatCurrencySigned
9. `src/lib/exportPdf.ts` — atualizar nomes das categorias
10. `src/lib/exportExcel.ts` — atualizar nomes das categorias e lógica CAC

