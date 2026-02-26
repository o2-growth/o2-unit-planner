

# Auto-save do estado da simulação

## Situação atual
Hoje o estado só é salvo quando o usuário clica manualmente em "Salvar Simulação". Se fechar a aba ou sair, perde tudo que não foi salvo.

Na inicialização, o `Index.tsx` já carrega do `localStorage` e, se logado, do banco de dados. Porém não há salvamento automático durante o preenchimento.

## Solução

Adicionar um `useEffect` com **debounce** no `Index.tsx` que salva automaticamente o estado a cada alteração:

1. **localStorage** — salva sempre (debounce de 1 segundo) para que mesmo usuários não logados mantenham o progresso
2. **Banco de dados** — se o usuário estiver logado, salva também no servidor (debounce de 3 segundos para evitar excesso de requests)

### Mudança técnica

**`src/pages/Index.tsx`**:
- Adicionar um `useEffect` que observa `state` e, após 1s de inatividade, salva no `localStorage`
- Adicionar outro `useEffect` que observa `state` + `user` e, após 3s de inatividade, faz upsert no banco (mesma lógica do `handleSave` atual)
- Usar `useRef` para os timers de debounce
- Pular o salvamento na primeira renderização (quando o estado está sendo carregado)

Nenhum outro arquivo precisa ser alterado. Os botões manuais continuam funcionando normalmente como opção explícita.

