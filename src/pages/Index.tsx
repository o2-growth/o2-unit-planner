import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SectionProfile } from '@/components/simulator/SectionProfile';
import { SectionGoals } from '@/components/simulator/SectionGoals';
import { SectionHorizon } from '@/components/simulator/SectionHorizon';
import { SectionCommercial } from '@/components/simulator/SectionCommercial';
import { SectionMatrixClients } from '@/components/simulator/SectionMatrixClients';
import { SectionChurn } from '@/components/simulator/SectionChurn';
import { SectionTaxes } from '@/components/simulator/SectionTaxes';
import { SectionRevenueRules } from '@/components/simulator/SectionRevenueRules';
import { SectionPL } from '@/components/simulator/SectionPL';
import { SectionROI } from '@/components/simulator/SectionROI';
import { SectionCharts } from '@/components/simulator/SectionCharts';
import { SectionResults } from '@/components/simulator/SectionResults';
import { ActionButtons } from '@/components/simulator/ActionButtons';
import { PremissasHeader } from '@/components/simulator/PremissasHeader';
import { AdminLogin } from '@/components/simulator/AdminLogin';
import { Card, CardContent } from '@/components/ui/card';

import { calculateProjections } from '@/lib/financial';
import { INITIAL_STATE, type SimulatorState } from '@/types/simulator';

function migrateState(parsed: any): SimulatorState {
  // Migrate from valorMensal to percentual in cost lines
  if (parsed.fixedCosts?.[0]?.valorMensal !== undefined) {
    parsed.fixedCosts = INITIAL_STATE.fixedCosts.map(c => ({ ...c }));
  }
  if (parsed.variableCostRates?.[0]?.valorMensal !== undefined) {
    parsed.variableCostRates = INITIAL_STATE.variableCostRates.map(c => ({ ...c }));
  }
  // Remove old belowEbitda fields
  if (parsed.belowEbitda?.outrasReceitas !== undefined || parsed.belowEbitda?.recFinanceiras !== undefined) {
    parsed.belowEbitda = { ...INITIAL_STATE.belowEbitda };
  }
  // Ensure investment fields
  if (!parsed.investment?.cupom && parsed.investment?.cupom !== '') {
    parsed.investment = { ...INITIAL_STATE.investment, ...parsed.investment };
  }
  // Remove setup from mix
  if (parsed.commercial?.mix?.setup !== undefined) {
    const { setup, ...rest } = parsed.commercial.mix;
    parsed.commercial.mix = rest;
  }
  // Migrate taxes: ensure setup field exists in aplicaA
  if (parsed.taxes?.impostos) {
    parsed.taxes.impostos = parsed.taxes.impostos.map((imp: any) => ({
      ...imp,
      aplicaA: { setup: 0, ...imp.aplicaA },
    }));
  }
  // Ensure goals fields
  if (!parsed.goals?.proLaboreDesejado && parsed.goals?.proLaboreDesejado !== 0) {
    parsed.goals = { ...INITIAL_STATE.goals, ...parsed.goals };
  }
  return parsed;
}

// Visibility helpers for transition cards only
function isProfileDone(state: SimulatorState) {
  return state.profile.nome.trim().length > 0;
}
function isGoalsDone(state: SimulatorState) {
  return state.goals.faturamento12m > 0;
}


const Index = () => {
  const { user } = useAuth();

  const [state, setState] = useState<SimulatorState>(() => {
    const saved = localStorage.getItem('o2-simulator');
    if (saved) {
      try {
        return migrateState(JSON.parse(saved));
      } catch { /* ignore */ }
    }
    return { ...INITIAL_STATE };
  });

  const dataReady = useRef(false);

  // Load from DB on mount
  useEffect(() => {
    if (!user) {
      dataReady.current = true;
      return;
    }
    supabase
      .from('simulations')
      .select('state')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.state) {
          setState(migrateState(data.state as any));
        }
        dataReady.current = true;
      });
  }, [user]);

  // Snapshot for "Restaurar Respostas Oficiais"
  const initialSnapshot = useRef<SimulatorState>(JSON.parse(JSON.stringify(state)));

  // Skip auto-save on first render (initial load)
  const isFirstRender = useRef(true);
  const localTimer = useRef<ReturnType<typeof setTimeout>>();
  const dbTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-save to localStorage (1s debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!dataReady.current) return;
    clearTimeout(localTimer.current);
    localTimer.current = setTimeout(() => {
      localStorage.setItem('o2-simulator', JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(localTimer.current);
  }, [state]);

  // Auto-save to DB (3s debounce, logged-in only)
  useEffect(() => {
    if (!user || !dataReady.current) return;
    clearTimeout(dbTimer.current);
    dbTimer.current = setTimeout(() => {
      supabase
        .from('simulations')
        .upsert(
          { user_id: user.id, state: state as any, nome: state.profile.nome || 'Minha Simulação', updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
    }, 3000);
    return () => clearTimeout(dbTimer.current);
  }, [state, user]);

  const projections = useMemo(() => calculateProjections(state), [state]);

  const update = useCallback(<K extends keyof SimulatorState>(key: K, value: SimulatorState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      commercial: { ...INITIAL_STATE.commercial, tickets: INITIAL_STATE.commercial.tickets.map(t => ({ ...t })), mix: { ...INITIAL_STATE.commercial.mix } },
      taxes: { impostos: INITIAL_STATE.taxes.impostos.map(t => ({ ...t, aplicaA: { ...t.aplicaA } })) },
      fixedCosts: INITIAL_STATE.fixedCosts.map(c => ({ ...c })),
      variableCostRates: INITIAL_STATE.variableCostRates.map(c => ({ ...c })),
      belowEbitda: { ...INITIAL_STATE.belowEbitda },
      investment: { ...INITIAL_STATE.investment },
    });
  }, []);

  const handleResetPremissas = useCallback(() => {
    const snap = initialSnapshot.current;
    setState(prev => ({
      ...prev,
      horizonte: snap.horizonte,
      commercial: JSON.parse(JSON.stringify(snap.commercial)),
      matrixClients: JSON.parse(JSON.stringify(snap.matrixClients)),
      churn: { ...snap.churn },
      goals: { ...snap.goals },
    }));
  }, []);

  // Visibility flags for transition cards
  const profileDone = isProfileDone(state);
  const goalsDone = isGoalsDone(state);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="o2-gradient px-4 pt-6 pb-7">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/logo-o2-color.svg"
              alt="O2 Inc."
              className="h-8 md:h-10 w-auto flex-shrink-0"
            />
            <AdminLogin />
          </div>
          <div className="mt-5 mb-1">
            <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase mb-2"
              style={{ color: 'hsl(100 71% 56%)' }}>
              Unit Planner
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Simulador de Business Plan
            </h1>
            <p className="text-white/55 text-sm mt-1">
              Monte a projeção financeira da sua unidade franqueada
            </p>
          </div>
        </div>
      </header>

      {/* Action buttons top */}
      <div className="max-w-4xl mx-auto px-4">
        <ActionButtons state={state} projections={projections} onReset={handleReset} onLoad={setState} />
      </div>

      {/* Sections */}
      <main className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
        {/* Section 1 - Profile */}
        <SectionProfile data={state.profile} onChange={v => update('profile', v)} />

        {/* Transition after profile */}
        {profileDone && (
          <div className="animate-fade-in">
            <Card className="border-primary bg-accent/50">
              <CardContent className="py-8 text-center">
                <p className="text-lg font-semibold text-primary italic">
                  "Muito obrigado por suas respostas, agora você está apto a montar o BP da sua unidade."
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 2 - Goals */}
        <SectionGoals data={state.goals} onChange={v => update('goals', v)} />

        {/* Transition after goals */}
        {goalsDone && (
          <div className="animate-fade-in">
            <Card className="border-primary bg-accent/50">
              <CardContent className="py-6 text-center">
                <p className="text-lg font-semibold text-primary italic">
                  "Excelente. Bora para os números."
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Section 3 - Horizon */}
        <SectionHorizon value={state.horizonte} onChange={v => update('horizonte', v)} />

        {/* Section 4 - Commercial */}
        <SectionCommercial data={state.commercial} onChange={v => update('commercial', v)} />

        {/* Section 5 - Matrix Clients */}
        <SectionMatrixClients data={state.matrixClients} onChange={v => update('matrixClients', v)} />

        {/* Section 6 - Churn */}
        <SectionChurn churnMensal={state.churn.churnMensal} onChangeChurn={v => update('churn', { churnMensal: v })} />

        {/* Section 7 - Taxes */}
        <SectionTaxes data={state.taxes} onChange={v => update('taxes', v)} />

        {/* Section 8 - Revenue Rules */}
        <SectionRevenueRules data={state.revenueRules} onChange={v => update('revenueRules', v)} />

        {/* Premissas Header */}
        <PremissasHeader state={state} onUpdate={update} onResetPremissas={handleResetPremissas} />

        {/* Section 9 - P&L */}
        <SectionPL
          projections={projections}
          fixedCosts={state.fixedCosts}
          variableCostRates={state.variableCostRates}
          belowEbitda={state.belowEbitda}
          goals={state.goals}
          proLaboreMode={state.proLaboreMode ?? 'custo_fixo'}
          onProLaboreModeChange={v => update('proLaboreMode', v)}
          onFixedCostsChange={v => update('fixedCosts', v)}
          onVariableCostsChange={v => update('variableCostRates', v)}
          onBelowEbitdaChange={v => update('belowEbitda', v)}
        />

        {/* Section 10 - ROI */}
        <SectionROI
          data={state.investment}
          onChange={v => update('investment', v)}
          projections={projections}
          metaROIMeses={state.goals.metaROIMeses}
        />

        {/* Charts */}
        <SectionCharts projections={projections} investment={state.investment} />

        {/* Results */}
        <SectionResults
          projections={projections}
          investment={state.investment}
          metaROIMeses={state.goals.metaROIMeses}
          churnMensal={state.churn.churnMensal}
        />

        {/* Bottom actions */}
        <ActionButtons state={state} projections={projections} onReset={handleReset} onLoad={setState} />
      </main>
    </div>
  );
};

export default Index;
