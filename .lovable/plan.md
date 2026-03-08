

## Plano: Alterar percentuais padrão das Despesas Fixas para 5%

### Alterações

**`src/types/simulator.ts`** (linhas 289-291):
- Marketing: 7.5 → 5
- Comerciais: 7.5 → 5
- Administrativas: 6 → 5

**`src/components/simulator/SectionPL.tsx`**:
- Atualizar tooltips e labels que referenciam "7,5%" para "5%"
- Linha 76: tooltip Marketing → "5% sobre receita bruta..."
- Linha 77: tooltip Comerciais → "5% sobre receita bruta total"
- Linha 428: label Marketing → "(5%)"
- Linha 429: label Comerciais → "(5%)"

