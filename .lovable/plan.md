

# Substituir Checkboxes por Campos Editaveis na Tabela de Impostos

## Resumo
Cada BU (CaaS, SaaS, Education, Expansao, Tax) tera sua propria aliquota editavel por imposto, em vez de um checkbox on/off. Isso permite definir cargas tributarias diferentes por linha de negocio.

## Mudanca de Dados

A estrutura `TaxConfig` muda de:
```text
aliquota: number (global)
aplicaA: { caas: boolean, saas: boolean, ... }
```
Para:
```text
aliquota: number (mantido como referencia/default)
aplicaA: { caas: number, saas: number, ... }
```

Cada valor em `aplicaA` passa a ser a aliquota especifica daquela BU (0 = nao se aplica).

## Arquivos modificados

### 1. `src/types/simulator.ts`
- Mudar tipo de `aplicaA` de `{ caas: boolean; ... }` para `{ caas: number; ... }`
- Atualizar `DEFAULT_TAXES`: onde era `true` passa a copiar o valor de `aliquota` (0 por padrao), onde era `false` fica 0

### 2. `src/components/simulator/SectionTaxes.tsx`
- Substituir os `Checkbox` por `Input` de numero em cada celula da tabela
- Remover import do `Checkbox`
- Cada campo editavel permite definir a aliquota especifica por BU
- Atualizar a descricao da secao para refletir a nova funcionalidade

### 3. `src/lib/financial.ts`
- Ajustar o calculo: em vez de `if (aplicaA[prod]) { total += receita * (aliquota / 100) }`, usar `total += receita * (aplicaA[prod] / 100)` diretamente

### 4. `src/pages/Index.tsx`
- Atualizar o deep clone de `aplicaA` (ja funciona igual pois a estrutura do objeto nao muda, so o tipo dos valores)

## Comportamento
- O campo "Aliquota (%)" global permanece como referencia rapida
- Cada celula por BU pode ter um valor diferente (ex: PIS pode ser 0.65% para CaaS e 1.65% para SaaS)
- Valor 0 significa que o imposto nao se aplica aquela BU
