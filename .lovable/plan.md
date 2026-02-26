

# Diagnóstico: Seções 2, 3, 4 sumiram

## Causa raiz

O auto-save para o banco de dados (adicionado na última alteração) possui uma **condição de corrida**: ele pode salvar o estado vazio/inicial no banco ANTES de o carregamento do banco completar, sobrescrevendo os dados reais.

Fluxo do problema:
```text
1. Página carrega → state = INITIAL_STATE (nome='', faturamento12m=0)
2. DB auto-save inicia timer de 3s com estado vazio
3. DB load começa (async)
4. Se DB load demora > 3s → auto-save grava INITIAL_STATE no banco!
5. Próximo reload carrega estado vazio do banco → seções somem
```

Como `profileDone` exige `nome.trim().length > 0` e `goalsDone` exige `faturamento12m > 0`, o estado zerado esconde as seções 2 (Goals), 3 (Horizon) e 4 (Commercial).

## Correção

**`src/pages/Index.tsx`**:

1. Adicionar um `useRef` `dbLoaded` que começa `false` e é setado para `true` após o DB load completar
2. No efeito de auto-save para DB, verificar `if (!dbLoaded.current) return;` antes de agendar o upsert
3. Fazer o mesmo para o auto-save de localStorage: usar um segundo ref `stateReady` que só fica true após o DB load (ou imediatamente se não há user)

Isso garante que nenhum auto-save ocorra antes dos dados reais serem carregados do banco.

