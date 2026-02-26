

# Explicação de cada mudança proposta

## O que será REMOVIDO

### 1. Funções de verificação: `isProfileDone`, `isGoalsDone`, `isMixDone`
**O que fazem:** Verificam se o usuário preencheu dados suficientes em cada etapa (nome preenchido, faturamento > 0, mix > 0).
**Impacto de remover:** Sem essas funções, nenhuma seção depende de preenchimento anterior para aparecer. Todas ficam visíveis desde o início.

### 2. Variáveis `profileDone`, `goalsDone`, `mixDone`
**O que fazem:** Guardam o resultado das verificações acima para uso nas condições de renderização.
**Impacto de remover:** Apenas consequência do item 1 — sem as funções, não precisa das variáveis.

### 3. Condições `{profileDone && ...}`, `{goalsDone && ...}`, `{mixDone && ...}`
**O que fazem:** Escondem as seções 2-12 até que a etapa anterior esteja completa. É isso que causa o sumiço das seções quando os dados são perdidos.
**Impacto de remover:** Todas as 12 seções renderizam sempre, na ordem correta, sem pré-requisitos.

## O que será MANTIDO

### 4. Cards de transição ("Muito obrigado..." e "Excelente. Bora para os números.")
**Situação atual:** Esses cards têm condições `{profileDone &&` e `{goalsDone &&`. 
**Opções:**
- **Manter com condição** — eles aparecem/desaparecem conforme preenchimento (comportamento atual, mas sem esconder seções)
- **Manter sempre visíveis** — ficam fixos entre as seções
- **Remover** — simplifica a interface

### 5. Auto-save (localStorage + banco de dados)
Continua funcionando exatamente como está, com o guard `dataReady` para evitar a condição de corrida.

### 6. Lógica de migração de estado (`migrateState`)
Continua intacta — garante compatibilidade com dados antigos salvos.

