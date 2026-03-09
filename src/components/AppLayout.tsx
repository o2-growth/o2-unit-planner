import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const PAGE_TITLES: Record<string, { tag: string; title: string; subtitle: string }> = {
  '/': { tag: 'Unit Planner', title: 'Dashboard', subtitle: 'Visão geral da sua simulação ativa' },
  '/simulador': { tag: 'Unit Planner', title: 'Simulador de Business Plan', subtitle: 'Monte a projeção financeira da sua unidade franqueada' },
  '/historico': { tag: 'Unit Planner', title: 'Histórico de Simulações', subtitle: 'Gerencie suas simulações salvas' },
};

export function AppLayout() {
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="o2-gradient px-4 pt-4 pb-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10" />
              </div>
              <span
                className="inline-block text-xs font-semibold tracking-[0.18em] uppercase mb-2"
                style={{ color: 'hsl(100 71% 56%)' }}
              >
                {page.tag}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {page.title}
              </h1>
              <p className="text-white/55 text-sm mt-1">{page.subtitle}</p>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
