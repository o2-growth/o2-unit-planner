

# Corrigir Largura dos Inputs e Adicionar Linha Total na Tabela de Impostos

## Problema
Os valores com decimais (ex: 0,65 / 2,88 / 1,08) estao sendo cortados porque os inputs tem largura fixa de `w-16` (64px), que e insuficiente para exibir numeros com 2 casas decimais.

## Solucao

### Arquivo: `src/components/simulator/SectionTaxes.tsx`

1. **Aumentar largura dos inputs**: Trocar `w-16` por `w-20` (80px) para comportar todos os valores sem corte

2. **Adicionar linha "Total" no rodape da tabela**: Uma linha `<tfoot>` que soma as aliquotas de cada coluna (BU), exibindo o total por produto. Os valores serao exibidos como texto (nao editaveis), formatados com ate 2 casas decimais.

```text
Estrutura da linha total:
Total  |  soma CaaS  |  soma SaaS  |  soma Setup  |  soma Education  |  soma Expansao  |  soma Tax
```

A soma sera calculada inline iterando `data.impostos` para cada produto.

