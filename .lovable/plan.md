

# Ajustar Label e Lógica da Receita Mensal Recorrente

## Mudanças

### 1. `src/components/simulator/SectionProfile.tsx` (linha 61)
- Alterar label de "Qual a receita total mensal hoje?" para "Qual a receita total mensal **recorrente** hoje?"

### 2. `src/lib/financial.ts` (linha 75)
- Alterar a lógica para que `receitaPreExistente` apareça em **todos os meses**, não apenas no mês 1
- Mudar de `m === 1 ? state.profile.receitaMensal : 0` para simplesmente `state.profile.receitaMensal`
- Isso faz sentido porque receita recorrente se mantém mês a mês (não é pontual)

### Impacto
A receita pré-existente recorrente será somada à receita bruta de CaaS em todos os meses da projeção, refletindo corretamente que é uma receita contínua do sócio.

