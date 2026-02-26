

# Tooltip com base de cálculo completa para ROI Direto e ROI Total

## Alteração única: `src/components/simulator/SectionROI.tsx`

Substituir o conteúdo das tooltips (Popover) de ROI Direto e ROI Total para mostrar a fórmula completa com os valores reais:

### ROI Direto (linhas ~203-205)
Conteúdo atual: texto genérico.
Novo conteúdo mostrará:
- **Fórmula:** Resultado Anual (12m) ÷ Taxa de Franquia × 100
- **Resultado Anual (12m):** soma dos `resultadoFinal` dos primeiros 12 meses (valor formatado)
- **Taxa de Franquia:** valor com/sem desconto (valor formatado)
- **= ROI Direto:** percentual final

### ROI Total (linhas ~218-220)
Conteúdo atual: texto genérico.
Novo conteúdo mostrará:
- **Fórmula:** Resultado Anual (12m) ÷ Investimento Total × 100
- **Resultado Anual (12m):** mesmo valor acima
- **Investimento Total:** Taxa de Franquia + Capital de Giro (com breakdown)
- **= ROI Total:** percentual final

### Implementação
- Calcular `resultadoAnual` localmente (já disponível via `projections.slice(0,12).reduce(...)`)
- Formatar todos os valores com `formatCurrency` e `formatPercent`
- Layout em lista vertical dentro do `PopoverContent` com `text-xs` e separadores visuais

