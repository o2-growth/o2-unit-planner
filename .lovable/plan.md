

## Plano: Plataforma com Sidebar — Dashboard, Simulador e Histórico

### 1. Migração de Banco de Dados

Alterar a tabela `simulations` para suportar múltiplas simulações por usuário:

```sql
-- Remover constraint unique em user_id (isOneToOne)
ALTER TABLE public.simulations DROP CONSTRAINT IF EXISTS simulations_user_id_key;

-- Adicionar coluna is_active
ALTER TABLE public.simulations ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Criar índice para busca rápida da simulação ativa
CREATE INDEX idx_simulations_user_active ON public.simulations(user_id, is_active) WHERE is_active = true;
```

### 2. Novos Arquivos

**`src/components/AppSidebar.tsx`**
- Sidebar shadcn com `collapsible="icon"`
- Logo O2 no topo
- 3 itens: Dashboard (LayoutDashboard), Simulador (Calculator), Histórico (History)
- NavLink com activeClassName para highlight
- Rodapé: nome do usuário + botão Sair

**`src/components/AppLayout.tsx`**
- `SidebarProvider` + `AppSidebar` + conteúdo principal
- Header com `o2-gradient` mantendo o visual atual (logo, "Unit Planner", título dinâmico por rota)
- `SidebarTrigger` no header
- `<Outlet />` para rotas filhas

**`src/pages/Dashboard.tsx`**
- Carrega simulação ativa do DB (ou localStorage)
- KPI cards: Receita Bruta Total, EBITDA, Margem EBITDA, Payback, ROI, MRR Final
- Gráficos recharts: AreaChart receita mensal, PieChart composição por BU, BarChart EBITDA vs Resultado
- Estado vazio com CTA para `/simulador` se não houver simulação

**`src/pages/Simulador.tsx`**
- Move todo conteúdo de `Index.tsx` (estado, hooks, auto-save, seções)
- Remove header (vai para AppLayout)
- Auto-save agora busca/grava pela simulação com `is_active = true` (em vez de upsert por user_id)
- "Nova Simulação" marca a atual como `is_active = false` e cria nova

**`src/pages/Historico.tsx`**
- Lista simulações do usuário ordenadas por `updated_at desc`
- Card com nome, data, status
- "Continuar": marca como ativa, redireciona para `/simulador`
- "Excluir": deleta do banco

### 3. Arquivos Alterados

**`src/App.tsx`**
- Rotas reestruturadas:
  - `/auth` — Auth (sem sidebar)
  - `ProtectedRoute` com `AppLayout`:
    - `/` — Dashboard
    - `/simulador` — Simulador
    - `/historico` — Histórico

**`src/pages/Index.tsx`**
- Substituído por redirect para `/` ou removido

**`src/App.css`**
- Remover `#root { max-width: 1280px }` que conflita com sidebar full-width

### 4. Header por Página

O header `o2-gradient` com logo fica no `AppLayout`, presente em todas as páginas. Cada página define seu título:
- Dashboard: "Dashboard"
- Simulador: "Simulador de Business Plan"  
- Histórico: "Histórico de Simulações"

O botão "Sair" e nome do usuário saem do header e vão para o rodapé da sidebar.

### Arquivos afetados
- `src/components/AppSidebar.tsx` (novo)
- `src/components/AppLayout.tsx` (novo)
- `src/pages/Dashboard.tsx` (novo)
- `src/pages/Simulador.tsx` (novo)
- `src/pages/Historico.tsx` (novo)
- `src/App.tsx` (rotas)
- `src/App.css` (remover max-width)
- `src/pages/Index.tsx` (removido/redirect)
- DB migration: `is_active` column + drop unique constraint

