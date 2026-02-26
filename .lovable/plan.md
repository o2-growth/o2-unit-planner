

# Diagnóstico: Por que o auto-save não funciona

## Causa raiz encontrada

A tabela `simulations` **não tem constraint UNIQUE na coluna `user_id`**. O código usa `upsert(..., { onConflict: 'user_id' })`, que exige uma constraint UNIQUE para funcionar. Sem ela, o upsert **falha silenciosamente** — não salva, não dá erro visível.

Além disso, quando você dá F5, o cleanup do `useEffect` cancela os timers pendentes antes que eles executem, e não há nenhum mecanismo para salvar antes da página descarregar.

## Correções

### 1. Migration: adicionar UNIQUE em `simulations.user_id`
```sql
ALTER TABLE public.simulations ADD CONSTRAINT simulations_user_id_unique UNIQUE (user_id);
```
Isso faz o `upsert` funcionar corretamente — encontra o registro existente e atualiza em vez de tentar inserir outro.

### 2. `src/pages/Index.tsx` — Adicionar flush no `beforeunload`
- Criar `stateRef` que sempre aponta para o `state` mais recente
- Registrar `window.addEventListener('beforeunload', flush)` que:
  - Salva imediatamente no `localStorage`
  - Se logado, envia ao banco via `navigator.sendBeacon()` (sobrevive ao unload)
- Remover listener no cleanup

### 3. `src/pages/Index.tsx` — Adicionar tratamento de erro no upsert
- Adicionar `.then(({ error }) => { if (error) console.error(...) })` ao upsert do auto-save para que erros apareçam no console em vez de serem engolidos silenciosamente.

