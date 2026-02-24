

# Padronizar Aliquotas de Impostos e Restringir Edicao a Admin

## Resumo
1. Adicionar coluna "Setup" na tabela de impostos (com as aliquotas de E-book da imagem)
2. Preencher todas as aliquotas padrao conforme a foto de referencia
3. Restringir edicao da tabela de impostos apenas para administradores
4. Confirmar que IRPJ/CSLL ja esta posicionado apos EBITDA no DRE (ja implementado)

## Aliquotas Padrao (conforme imagem)

```text
Imposto   | CaaS  | SaaS  | Setup | Education | Expansao | Tax
----------|-------|-------|-------|-----------|----------|------
PIS       | 0.65  | 0.65  | 0.00  | 0.65      | 0.65     | 0.65
COFINS    | 3.00  | 3.00  | 0.00  | 3.00      | 3.00     | 3.00
IRPJ      | 5.70  | 5.70  | 2.10  | 5.70      | 5.70     | 5.70
CSLL      | 2.88  | 2.88  | 1.08  | 2.88      | 2.88     | 2.88
ISSQN     | 2.90  | 2.90  | 0.00  | 2.00      | 5.00     | 2.00
ICMS      | 0.00  | 0.00  | 0.00  | 0.00      | 0.00     | 0.00
```

- "Setup" usa as aliquotas do "E-book" da imagem (subproduto do SaaS)
- "Expansao" usa os valores da coluna "Expansao" da imagem (franquia = expansao)

## Arquivos modificados

### 1. `src/types/simulator.ts`
- Adicionar `setup: number` ao tipo `aplicaA` em `TaxConfig`
- Atualizar `DEFAULT_TAXES` com todos os valores padrao da tabela acima
- A coluna "Aliquota" global sera removida (cada BU tem sua propria aliquota)

### 2. `src/components/simulator/SectionTaxes.tsx`
- Adicionar "Setup" ao array PRODUCTS
- Receber `isAdmin` via `useAuth()` e desabilitar inputs quando nao for admin
- Exibir badge "Somente Admin" quando usuario nao for administrador (mesmo padrao do SectionRevenueRules)

### 3. `src/lib/financial.ts`
- Incluir `setup` no calculo de deducoes, usando a receita de Setup (pontual) como base para a coluna Setup
- Adicionar `receitaBrutaSetup` no `revenueByProduct` para o calculo correto dos impostos sobre Setup

### 4. `src/pages/Index.tsx`
- Adicionar migracao no `migrateState` para garantir que estados salvos antigos recebam o campo `setup` em `aplicaA`

## Sobre IRPJ/CSLL no DRE
O IRPJ e CSLL ja estao posicionados corretamente apos o EBITDA e antes do Lucro Liquido na implementacao atual. Nao ha alteracao necessaria neste ponto.

