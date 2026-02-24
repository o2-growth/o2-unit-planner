

# Remover Barra de Progresso e Corrigir Numeracao das Secoes

## Resumo
Remover completamente a barra de progresso do header sticky e corrigir a numeracao das secoes que atualmente pula os numeros 9 e 12.

## Mudancas

### 1. Remover barra de progresso
- Remover o bloco sticky com `Progress` do `Index.tsx` (linhas 179-187)
- Remover a importacao do componente `Progress`
- Remover a funcao `getProgress()` que ja nao sera usada

### 2. Corrigir numeracao das secoes
Renumerar sequencialmente de 1 a 12:

| Atual | Novo | Secao |
|-------|------|-------|
| 1 | 1 | Perfil do Novo Socio |
| 2 | 2 | Objetivos do Franqueado |
| 3 | 3 | Horizonte de Projecao |
| 4 | 4 | Premissas Comerciais |
| 5 | 5 | Clientes Comprados da Matriz |
| 6 | 6 | Churn sobre MRR |
| 7 | 7 | Impostos/Deducoes |
| 8 | 8 | Regras Comerciais/Receita |
| 10 | 9 | DRE Gerencial |
| 11 | 10 | ROI e Payback |
| 13 | 11 | Graficos de Resultados |
| 14 | 12 | Resultados da Simulacao |

### Arquivos modificados

- `src/pages/Index.tsx` - Remover barra de progresso, funcao `getProgress`, importacao de `Progress`
- `src/components/simulator/SectionPL.tsx` - Mudar number de 10 para 9
- `src/components/simulator/SectionROI.tsx` - Mudar number de 11 para 10
- `src/components/simulator/SectionCharts.tsx` - Mudar number de 13 para 11
- `src/components/simulator/SectionResults.tsx` - Mudar number de 14 para 12

Secoes 1-8 permanecem inalteradas.

