

## Plano: Corrigir alinhamento visual do PremissasHeader

### Problema
O bloco "Venda Própria (Seção 4)" tem 7 campos em um `grid-cols-4`, resultando em 4 na primeira linha e 3 na segunda, desalinhados. Os labels têm tamanhos diferentes e os CurrencyInputs não têm `mt-1`, criando inconsistência vertical com os Inputs normais.

### Solução

**Arquivo:** `src/components/simulator/PremissasHeader.tsx`

1. **Venda Própria** — reorganizar em duas linhas lógicas claras:
   - Linha 1 (quantidades): CAAS/mês, SAAS/mês, Diagnóstico/mês — `grid-cols-3`
   - Linha 2 (tickets): Ticket CAAS, Ticket SAAS, Ticket Diagnóstico, Ticket Setup — `grid-cols-4`
   - Isso agrupa campos por natureza (quantidades vs valores) e evita linha incompleta

2. **Clientes Matriz** — já está com 4 campos em `grid-cols-4`, OK. Apenas garantir que os CurrencyInputs tenham `mt-1` consistente com os Inputs.

3. **Consistência vertical** — adicionar `mt-1` em todos os `CurrencyInput` que não o têm, para alinhar com os `Input` que já têm `mt-1`.

