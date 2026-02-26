

# Análise: Origens de Clientes e Tickets nas Premissas

## Situação Atual

Analisando o código (`financial.ts` e `PremissasHeader.tsx`):

**Os dois fluxos JÁ estão separados no cálculo do DRE:**
- **Seção 4 (Venda Própria):** `mix.caas`, `mix.saas`, `mix.diagnostico` com tickets próprios (`tCaas`, `tSaas`, `tSetup`, `tDiag`) geram MRR recorrente (CAAS/SAAS) e receita pontual (Setup/Diagnóstico).
- **Seção 5 (Matriz):** `matrixClients.qtdMensalInicial` com `setupPorCliente`, `mrrPorCliente` e `cacPorCliente` geram receita separada.

**O problema é visual:** A seção "Premissas — Ajuste Rápido" mistura os campos das duas origens sem distinção. Os labels "CAAS/mês", "Ticket CAAS" etc. referem-se à venda própria (Seção 4), e "Clientes Matriz" e "CAC/cliente" referem-se à Seção 5, mas não está claro.

Além disso, faltam na Premissas os campos de **Setup e MRR por cliente da Matriz** (`setupPorCliente`, `mrrPorCliente`), que são editáveis na Seção 5 mas não aparecem no ajuste rápido.

## Plano de Implementação

### Arquivo: `src/components/simulator/PremissasHeader.tsx`

1. **Reorganizar o grid em dois blocos visuais separados:**
   - **Bloco "Venda Própria (Seção 4)"** — com borda/label agrupando: CAAS/mês, SAAS/mês, Diagnóstico/mês, Ticket CAAS, Ticket SAAS, Ticket Diagnóstico, Ticket Setup
   - **Bloco "Clientes Matriz (Seção 5)"** — agrupando: Clientes Matriz (mês 1), CAC/cliente, **Setup/cliente** (novo), **MRR/cliente** (novo)

2. **Adicionar os campos faltantes da Matriz:** `setupPorCliente` e `mrrPorCliente` como `CurrencyInput` editáveis no bloco da Matriz.

3. **Manter campos globais fora dos blocos:** Horizonte, Churn MRR, Pró-labore alvo.

### Detalhes Técnicos

- Cada bloco terá um subtítulo (`<p className="text-xs font-semibold ...">`) e um container com borda sutil para separação visual.
- Campos `setupPorCliente` e `mrrPorCliente` já existem no `matrixClients` do state — basta conectar via `onUpdate('matrixClients', {...})`.
- Nenhuma mudança no `financial.ts` — os cálculos já tratam as duas fontes corretamente.
- Nenhuma mudança no schema/banco.

