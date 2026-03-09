import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateProjections } from '@/lib/financial';
import { INITIAL_STATE, type SimulatorState, type MonthlyProjection, type InvestmentData } from '@/types/simulator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingUp, DollarSign, BarChart3, Target, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function fmtPct(v: number) {
  return (v * 100).toFixed(1) + '%';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<SimulatorState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from('simulations')
      .select('state')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.state) setState(data.state as unknown as SimulatorState);
        setLoading(false);
      });
  }, [user]);

  const projections = useMemo(() => state ? calculateProjections(state) : [], [state]);
  const last = projections[projections.length - 1];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!state || projections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <Calculator className="h-16 w-16 mx-auto text-muted-foreground/40" />
        <h2 className="text-xl font-semibold text-foreground">Nenhuma simulação ativa</h2>
        <p className="text-muted-foreground">Crie sua primeira simulação para visualizar o dashboard.</p>
        <Button onClick={() => navigate('/simulador')} className="gap-2">
          <Calculator className="h-4 w-4" /> Ir para o Simulador
        </Button>
      </div>
    );
  }

  // KPIs
  const receitaTotal = projections.reduce((s, p) => s + p.receitaBrutaTotal, 0);
  const ebitdaTotal = projections.reduce((s, p) => s + p.ebitda, 0);
  const margemEbitda = receitaTotal > 0 ? ebitdaTotal / receitaTotal : 0;
  const lucroLiqTotal = projections.reduce((s, p) => s + p.resultadoLiquido, 0);

  const inv = state.investment;
  const totalInv = inv.taxaFranquia + inv.capitalGiro + inv.implantacao + inv.marketingInicial + inv.equipamentos + inv.outros;
  let cumulativo = 0;
  let paybackMonth = 0;
  for (const p of projections) {
    cumulativo += p.resultadoFinal;
    if (cumulativo >= totalInv && paybackMonth === 0) paybackMonth = p.month;
  }
  const roiTotal = totalInv > 0 ? cumulativo / totalInv : 0;
  const mrrFinal = last?.mrrTotal ?? 0;

  const kpis = [
    { label: 'Receita Bruta Total', value: fmt(receitaTotal), icon: DollarSign, color: 'text-emerald-600' },
    { label: 'EBITDA Total', value: fmt(ebitdaTotal), icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Margem EBITDA', value: fmtPct(margemEbitda), icon: BarChart3, color: 'text-violet-600' },
    { label: 'Payback', value: paybackMonth > 0 ? `${paybackMonth} meses` : 'N/A', icon: Clock, color: 'text-amber-600' },
    { label: 'ROI Total', value: fmtPct(roiTotal), icon: Target, color: 'text-rose-600' },
    { label: 'MRR Final', value: fmt(mrrFinal), icon: DollarSign, color: 'text-teal-600' },
  ];

  // Chart data
  const revenueChart = projections.map(p => ({
    mes: `M${p.month}`,
    receita: Math.round(p.receitaBrutaTotal),
    ebitda: Math.round(p.ebitda),
  }));

  const pieData = [
    { name: 'CAAS', value: projections.reduce((s, p) => s + p.receitaBrutaCaas, 0) },
    { name: 'SAAS', value: projections.reduce((s, p) => s + p.receitaBrutaSaas, 0) },
    { name: 'Expansão', value: projections.reduce((s, p) => s + p.receitaBrutaExpansao, 0) },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['hsl(100, 65%, 38%)', 'hsl(210, 65%, 50%)', 'hsl(35, 85%, 55%)'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue evolution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmt(v)} />
                <Area type="monotone" dataKey="receita" name="Receita" fill="hsl(100, 65%, 38%)" fillOpacity={0.15} stroke="hsl(100, 65%, 38%)" strokeWidth={2} />
                <Area type="monotone" dataKey="ebitda" name="EBITDA" fill="hsl(210, 65%, 50%)" fillOpacity={0.15} stroke="hsl(210, 65%, 50%)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by BU */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Composição de Receita</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* EBITDA vs Resultado */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-4 text-foreground">EBITDA vs Resultado Líquido</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChart.map((d, i) => ({ ...d, resultado: Math.round(projections[i].resultadoLiquido) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Bar dataKey="ebitda" name="EBITDA" fill="hsl(100, 65%, 38%)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="resultado" name="Resultado Líquido" fill="hsl(210, 65%, 50%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
