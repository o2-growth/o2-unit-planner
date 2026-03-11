

## Plano: Confirmação ao trocar regime tributário

### Comportamento
- Remover `disabled={!isAdmin}` dos botões de regime (qualquer usuário pode escolher)
- Ao clicar no regime **já selecionado**, nada acontece
- Ao clicar no regime **diferente do atual**, abrir um `AlertDialog` perguntando: "Deseja alterar o regime tributário para [nome]?"
  - **Sim**: altera o regime
  - **Não**: fecha o dialog sem alterar

### Implementação em `src/components/simulator/SectionTaxes.tsx`

1. Adicionar state `pendingRegime` (`string | null`) para armazenar o regime que o usuário quer trocar
2. No `onClick` dos botões: se o regime clicado for diferente do atual, setar `pendingRegime` em vez de chamar `onChange` diretamente
3. Renderizar um `AlertDialog` controlado por `pendingRegime !== null`:
   - Título: "Alterar Regime Tributário"
   - Descrição: "Deseja alterar o regime para [Lucro Presumido / Simples Nacional]?"
   - Action (Sim): chama `onChange({ ...data, regime: pendingRegime })` e reseta `pendingRegime`
   - Cancel (Não): reseta `pendingRegime`
4. Remover `disabled={!isAdmin}` dos dois botões

### Arquivo afetado
- `src/components/simulator/SectionTaxes.tsx`

