

# Melhorias de UX: Revelacao Progressiva e Mensagens Condicionais

## Problema Principal
Todas as secoes e mensagens de transicao ("Muito obrigado por suas respostas...", "Excelente. Bora para os numeros.") aparecem imediatamente, antes do usuario preencher qualquer campo. Isso quebra a experiencia de uma jornada guiada e faz o simulador parecer um formulario generico em vez de uma ferramenta profissional de planejamento.

## Solucao: Revelacao Progressiva

Implementar logica de visibilidade condicional no `Index.tsx` para que cada secao e mensagem de transicao so apareca apos a secao anterior ter dados preenchidos. A identidade visual permanece intacta.

### Regras de Visibilidade

```text
Secao 1 - Perfil              -> Sempre visivel
  Mensagem "Muito obrigado..." -> Visivel quando Perfil tem nome preenchido
Secao 2 - Objetivos           -> Visivel quando Perfil tem nome preenchido  
  Mensagem "Excelente..."     -> Visivel quando Objetivos tem faturamento12m > 0
Secao 3 - Horizonte           -> Visivel quando Objetivos tem faturamento12m > 0
Secao 4 - Premissas Comerciais -> Visivel quando Horizonte selecionado (sempre true, default=12)
Secao 5 - Clientes Matriz     -> Visivel quando mix total > 0
Secao 6 - Churn               -> Visivel quando secao 5 visivel
Secao 7 - Impostos            -> Visivel quando secao 6 visivel
Secao 8 - Regras Comerciais   -> Visivel quando secao 7 visivel
Premissas Header               -> Visivel quando secao 8 visivel
Secao 9 - DRE (P&L)           -> Visivel quando secao 8 visivel
Secao 10 - ROI                -> Visivel quando secao 9 visivel
Graficos                       -> Visivel quando secao 10 visivel
Resultados                     -> Visivel quando secao 10 visivel
```

### Barra de Progresso
Adicionar uma barra de progresso fixa no topo (abaixo do header) mostrando quantas etapas o usuario completou, sem alterar cores ou tipografia.

### Correcao de Numeracao
Ajustar a numeracao das secoes para ser sequencial: 1, 2, 3, 4... em vez de 1, 3, 4, 5...

## Detalhes Tecnicos

### Arquivo: `src/pages/Index.tsx`
- Criar funcoes helper para verificar completude de cada secao (ex: `isProfileDone`, `isGoalsDone`)
- Envolver cada secao e mensagem de transicao em renderizacao condicional
- Adicionar componente de progresso simples (div com barra percentual) entre o header e o conteudo
- Corrigir prop `number` nos `SectionHeader` para ser sequencial

### Arquivo: `src/components/simulator/SectionGoals.tsx`
- Alterar `number={3}` para `number={2}`

### Arquivo: `src/components/simulator/SectionHorizon.tsx`
- Alterar `number={4}` para `number={3}`

### Arquivo: `src/components/simulator/SectionCommercial.tsx`
- Alterar `number={5}` para `number={4}`

### Arquivo: `src/components/simulator/SectionMatrixClients.tsx`
- Alterar `number={6}` para `number={5}`

### Arquivo: `src/components/simulator/SectionChurn.tsx`
- Alterar `number={7}` para `number={6}`

### Arquivo: `src/components/simulator/SectionTaxes.tsx`
- Alterar `number={8}` para `number={7}`

### Arquivo: `src/components/simulator/SectionRevenueRules.tsx`
- Alterar `number={9}` para `number={8}`

### Comportamento
- Secoes aparecem com transicao suave (CSS transition opacity/transform)
- Ao carregar simulacao salva com dados, todas as secoes relevantes aparecem imediatamente
- O botao "Resetar Premissas" volta o formulario ao estado inicial (so secao 1 visivel)

