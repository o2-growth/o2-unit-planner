

# Reestruturação do DRE + Correção ROI/Payback + Toggle Pró-labore

## 1. Reestruturação do DRE

### Estrutura atual (errada)
Receita Bruta → (-) Impostos → = Receita Líquida → (-) Custos Variáveis (inclui Royalties + CAC) → = Lucro Bruto

### Estrutura nova (correta)
```text
  Receita Bruta
  (-) Impostos (PIS, COFINS, ISSQN, ICMS)
  (-) Royalties (20%)
  = Receita Líquida
  (-) Custos Variáveis (CAAS, SAAS, Education, CS, Expansão, Tax, CAC)
  = Margem de Contribuição
  (-) Despesas Fixas
  = Resultado Operacional (antigo EBITDA)
  ... abaixo do EBITDA permanece igual
```

### Arquivos alterados

**`src/lib/financial.ts`**:
- Mover `royaltiesValor` para antes da Receita Líquida: `receitaLiquida = receitaBrutaTotal - deducoesTotal - royaltiesValor`
- Remover `royaltiesValor` do `custosVariaveisTotal`
- Adicionar campo `cargaTotalPercent` = `(deducoesTotal + royaltiesValor) / receitaBrutaTotal * 100`

**`src/types/simulator.ts`** (MonthlyProjection):
- Adicionar campo `cargaTotalPercent: number`
- Renomear conceito de `lucroBruto` para `margemContribuicao` (internamente mantém nome para não quebrar muito)

**`src/components/simulator/SectionPL.tsx`**:
- Adicionar linha "(-) Royalties (20%)" como dedução após impostos (grupo deducoes ou linha própria)
- Indicador visual da carga total (% sobre Receita Bruta) como badge/chip na linha de Receita Líquida
- Renomear "LUCRO BRUTO (Margem Contribuição)" para "= MARGEM DE CONTRIBUIÇÃO"
- Renomear "EBITDA" para "= RESULTADO OPERACIONAL"

---

## 2. Correção ROI/Payback

### Bug identificado
Em `SectionROI.tsx` linha 170: quando `paybackMeses === 0` mostra "Preencha os investimentos", mas payback pode ser 0 porque o retorno acumulado nunca alcança o investimento dentro do horizonte (não porque campos estão vazios).

### Correção

**`src/lib/financial.ts`** (`calculateROI`):
- Se o payback não for atingido dentro do horizonte, retornar `paybackMeses = -1` (indica "não atingido") em vez de 0
- Retornar 0 somente quando não há projeções

**`src/components/simulator/SectionROI.tsx`**:
- `paybackMeses === 0` → "Preencha os investimentos"
- `paybackMeses === -1` → "Payback excede o horizonte"
- `paybackMeses > 0` → lógica normal de meta

### Gráfico - destaque do ponto de cruzamento

**`src/components/simulator/SectionCharts.tsx`**:
- Adicionar um ponto (dot) destacado no mês exato onde o retorno acumulado cruza o investimento
- Usar `ReferenceDot` do recharts no ponto de cruzamento com cor e tamanho destacados

---

## 3. Toggle Pró-labore

### Nova opção configurável

**`src/types/simulator.ts`**:
- Adicionar campo `proLaboreMode: 'custo_fixo' | 'distribuicao'` no `SimulatorState`
- Default: `'custo_fixo'` (comportamento atual)

**`src/lib/financial.ts`**:
- Se `proLaboreMode === 'custo_fixo'`: comportamento atual (pró-labore como despesa fixa)
- Se `proLaboreMode === 'distribuicao'`: `despPessoal = 0` no DRE, pró-labore é descontado apenas quando `resultadoFinal > 0` (retirada pós-lucro, não impacta a estrutura de custos)

**`src/components/simulator/SectionPL.tsx`** ou **`SectionGoals.tsx`**:
- Adicionar Switch/Toggle com as duas opções:
  - "Pró-labore incluso como custo fixo mensal no DRE" (default)
  - "Pró-labore retirado apenas após lucro (distribuição)"
- Posicionar próximo às despesas fixas na SectionPL

**`src/pages/Index.tsx`**:
- Passar `proLaboreMode` para os componentes necessários

---

## Impacto nos cálculos
- Royalties sai dos custos variáveis e entra como dedução da receita bruta, o que altera Receita Líquida, Margem de Contribuição e todos os indicadores subsequentes
- O ROI e Payback são recalculados corretamente sem bloqueio falso
- O toggle de pró-labore permite cenários diferentes de simulação (conservador vs otimista)

