

# Reorganizar botões de ação em duas linhas

## Mudança

No componente `src/components/simulator/ActionButtons.tsx`, reorganizar os 5 botões em duas linhas:

**Linha 1:** Salvar Simulação | Carregar Simulação | Resetar Premissas
**Linha 2:** Exportar PDF | Exportar Excel

Trocar o `flex flex-wrap` atual por duas divs separadas com `flex justify-center`, mantendo gap consistente.

## Arquivo alterado

**`src/components/simulator/ActionButtons.tsx`** — Substituir o container único por dois grupos de botões empilhados verticalmente.

