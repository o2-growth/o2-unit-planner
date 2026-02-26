
Objetivo: corrigir o caso em que o auto-save falha quando o usuário digita e dá F5 sem clicar fora do campo.

Plano de implementação:

1) Corrigir origem do problema no `CurrencyInput`
- Arquivo: `src/components/simulator/CurrencyInput.tsx`
- Ajustar `handleChange` para também chamar `onChange(parseCurrencyInput(raw))` a cada digitação (não só no `onBlur`).
- Manter `onBlur` apenas para normalizar/formatar exibição (`formatCurrencyInput`).
- Garantir sincronização do `display` com `value` externo quando não estiver focado (evita UI “presa” em valor antigo).

2) Corrigir parse monetário para formato BR
- Arquivo: `src/lib/formatters.ts`
- Melhorar `parseCurrencyInput` para tratar milhares e decimais corretamente:
  - remover separador de milhar `.`
  - converter decimal `,` para `.`
  - parse final numérico confiável.
- Isso evita interpretações inconsistentes (ex.: “20.000,00” virar 20 em cenários específicos).

3) Preservar auto-save atual (sem mudança de backend)
- Manter debounce local (1s), debounce no banco (3s) e flush no `beforeunload`.
- Não mexer em esquema/tabelas/políticas, pois o envio automático já aparece com status 200 nas requisições recentes.

4) Validação funcional (foco no bug reportado)
- Teste A (sem blur): editar nome + valor monetário e pressionar F5 diretamente.
- Teste B (com espera): editar, aguardar >5s, F5.
- Teste C (comparação): repetir fluxo e comparar com botão “Salvar Simulação”.
- Critério de aceite: dados persistem nos 3 cenários e recarregam corretamente após refresh.

Detalhes técnicos (resumo):
- Causa raiz observada: campos monetários só propagam valor para `state` no `onBlur`; se usuário recarrega com foco no input, o `state` global não recebe a última edição e o auto-save grava valor anterior.
- Correção principal: tornar atualização de estado “on type” no `CurrencyInput`, mantendo formatação final no blur.
