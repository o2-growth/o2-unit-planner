## Plano: Plataforma com Sidebar — Dashboard, Simulador e Histórico

**Status: ✅ Implementado**

### Mudanças realizadas

1. **DB Migration**: Removida constraint unique em `user_id`, adicionada coluna `is_active`
2. **AppSidebar** + **AppLayout**: Sidebar colapsável com nav, logo, logout
3. **Dashboard**: KPIs + gráficos da simulação ativa
4. **Simulador**: Migrado de Index.tsx, auto-save por `is_active`
5. **Histórico**: Lista simulações, ativar/excluir
6. **App.tsx**: Rotas reestruturadas com layout compartilhado
