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

import { calculateProjections } from '@/lib/financial';
import { INITIAL_STATE, DEFAULT_BUS, type SimulatorState } from '@/types/simulator';

function migrateState(parsed: any): SimulatorState {
  if (parsed.fixedCosts?.[0]?.valorMensal !== undefined) {
    parsed.fixedCosts = INITIAL_STATE.fixedCosts.map(c => ({ ...c }));
  }
  if (parsed.variableCostRates?.[0]?.valorMensal !== undefined) {
    parsed.variableCostRates = INITIAL_STATE.variableCostRates.map(c => ({ ...c }));
  }
  if (parsed.belowEbitda?.outrasReceitas !== undefined || parsed.belowEbitda?.recFinanceiras !== undefined) {
    parsed.belowEbitda = { ...INITIAL_STATE.belowEbitda };
  }
  if (!parsed.investment?.cupom && parsed.investment?.cupom !== '') {
    parsed.investment = { ...INITIAL_STATE.investment, ...parsed.investment };
  }
  if (parsed.commercial?.mix?.setup !== undefined) {
    const { setup, ...rest } = parsed.commercial.mix;
    parsed.commercial.mix = rest;
  }
  if (parsed.taxes?.impostos && !parsed.taxes?.regime) {
    parsed.taxes = {
      regime: 'lucro_presumido',
      faturamentoTotalMes: 0,
      bus: DEFAULT_BUS.map(b => ({ ...b })),
      simples: { rbt12: 0, folha12m: 0, fatorR: 0, anexo: 'III' },
    };
  }
  const VALID_BU_KEYS = DEFAULT_BUS.map(b => b.buKey);
  if (parsed.taxes?.regime && parsed.taxes?.bus) {
    const buLookup = Object.fromEntries(DEFAULT_BUS.map(b => [b.buKey, b]));
    parsed.taxes.bus = parsed.taxes.bus
      .filter((b: any) => VALID_BU_KEYS.includes(b.buKey))
      .map((b: any) => ({
        ...(buLookup[b.buKey] || DEFAULT_BUS[0]),
        ...b,
        faturamentoBU: b.faturamentoBU ?? 0,
        anexoSimples: b.anexoSimples ?? 'III',
        sujeitoFatorR: b.sujeitoFatorR ?? (b.buKey === 'caas'),
      }));
    for (const def of DEFAULT_BUS) {
      if (!parsed.taxes.bus.find((b: any) => b.buKey === def.buKey)) {
        parsed.taxes.bus.push({ ...def });
      }
    }
    if (!parsed.taxes.simples) {
      parsed.taxes.simples = { rbt12: 0, folha12m: 0, fatorR: 0, anexo: 'III' };
    }
  }
  if (parsed.variableCostRates && parsed.variableCostRates.length > 2) {
    parsed.variableCostRates = parsed.variableCostRates.filter((c: any) => c.key === 'caas' || c.key === 'saas');
    if (parsed.variableCostRates.length === 0) {
      parsed.variableCostRates = INITIAL_STATE.variableCostRates.map((c: any) => ({ ...c }));
    }
  }
  if (!parsed.goals?.proLaboreDesejado && parsed.goals?.proLaboreDesejado !== 0) {
    parsed.goals = { ...INITIAL_STATE.goals, ...parsed.goals };
  }
  if (!parsed.socios) {
    parsed.socios = { ...INITIAL_STATE.socios, socios: INITIAL_STATE.socios.socios.map(s => ({ ...s })) };
  }
  return parsed;
}

const Simulador = () => {
  const { user } = useAuth();

  const [state, setState] = useState<SimulatorState>(() => {
    const saved = localStorage.getItem('o2-simulator');
    if (saved) {
      try { return migrateState(JSON.parse(saved)); } catch { /* ignore */ }
    }
    return { ...INITIAL_STATE };
  });

  const [activeSimId, setActiveSimId] = useState<string | null>(null);
  const dataReady = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const userRef = useRef(user);
  userRef.current = user;
  const activeSimIdRef = useRef(activeSimId);
  activeSimIdRef.current = activeSimId;

  // Load active simulation from DB
  useEffect(() => {
    if (!user) { dataReady.current = true; return; }
    supabase
      .from('simulations')
      .select('id, state')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.state) {
          setState(migrateState(data.state as any));
          setActiveSimId(data.id);
        }
        dataReady.current = true;
      });
  }, [user]);

  const initialSnapshot = useRef<SimulatorState>(JSON.parse(JSON.stringify(state)));

  const isFirstRender = useRef(true);
  const localTimer = useRef<ReturnType<typeof setTimeout>>();
  const dbTimer = useRef<ReturnType<typeof setTimeout>>();

  // Auto-save to localStorage
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!dataReady.current) return;
    clearTimeout(localTimer.current);
    localTimer.current = setTimeout(() => {
      localStorage.setItem('o2-simulator', JSON.stringify(state));
    }, 1000);
    return () => clearTimeout(localTimer.current);
  }, [state]);

  // Auto-save to DB (active simulation)
  useEffect(() => {
    if (!user || !dataReady.current) return;
    clearTimeout(dbTimer.current);
    dbTimer.current = setTimeout(() => {
      const payload: any = {
        user_id: user.id,
        state: state as any,
        nome: state.profile.nome || 'Minha Simulação',
        updated_at: new Date().toISOString(),
        is_active: true,
      };
      if (activeSimId) {
        supabase.from('simulations').update(payload).eq('id', activeSimId)
          .then(({ error }) => { if (error) console.error('[auto-save]', error); });
      } else {
        supabase.from('simulations').insert(payload).select('id').single()
          .then(({ data, error }) => {
            if (error) console.error('[auto-save]', error);
            if (data?.id) setActiveSimId(data.id);
          });
      }
    }, 3000);
    return () => clearTimeout(dbTimer.current);
  }, [state, user, activeSimId]);

  // Flush on unload
  useEffect(() => {
    const flush = () => {
      const s = stateRef.current;
      localStorage.setItem('o2-simulator', JSON.stringify(s));
      const u = userRef.current;
      const simId = activeSimIdRef.current;
      if (u && dataReady.current && simId) {
        const body = JSON.stringify({
          state: s,
          nome: s.profile.nome || 'Minha Simulação',
          updated_at: new Date().toISOString(),
        });
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/simulations?id=eq.${simId}`;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const sessionStr = localStorage.getItem('sb-ktfnnhfvkpgxdnmjqtft-auth-token');
        const accessToken = sessionStr ? JSON.parse(sessionStr)?.access_token : null;
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${accessToken || anonKey}`,
          },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  const projections = useMemo(() => calculateProjections(state), [state]);

  const update = useCallback(<K extends keyof SimulatorState>(key: K, value: SimulatorState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setState({
      ...INITIAL_STATE,
      commercial: { ...INITIAL_STATE.commercial, tickets: INITIAL_STATE.commercial.tickets.map(t => ({ ...t })), mix: { ...INITIAL_STATE.commercial.mix } },
      taxes: { ...INITIAL_STATE.taxes, bus: INITIAL_STATE.taxes.bus.map(b => ({ ...b })), simples: { ...INITIAL_STATE.taxes.simples } },
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

  return (
    <div className="bg-background">
      {/* Action buttons top */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <ActionButtons state={state} projections={projections} onReset={handleReset} onLoad={setState} />
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
        <SectionProfile data={state.profile} onChange={v => update('profile', v)} />
        <SectionGoals data={state.goals} onChange={v => update('goals', v)} />
        <SectionHorizon value={state.horizonte} onChange={v => update('horizonte', v)} />
        <SectionCommercial data={state.commercial} onChange={v => update('commercial', v)} />
        <SectionMatrixClients data={state.matrixClients} onChange={v => update('matrixClients', v)} />
        <SectionChurn churnMensal={state.churn.churnMensal} onChangeChurn={v => update('churn', { churnMensal: v })} />
        <SectionTaxes data={state.taxes} onChange={v => update('taxes', v)} projections={projections} profileData={state.profile} sociosData={state.socios} />
        <SectionRevenueRules data={state.revenueRules} onChange={v => update('revenueRules', v)} />
        <PremissasHeader state={state} onUpdate={update} onResetPremissas={handleResetPremissas} />

        <SectionPL
          projections={projections}
          fixedCosts={state.fixedCosts}
          variableCostRates={state.variableCostRates}
          belowEbitda={state.belowEbitda}
          goals={state.goals}
          proLaboreMode={state.proLaboreMode ?? 'custo_fixo'}
          socios={state.socios}
          regime={state.taxes.regime || 'lucro_presumido'}
          onProLaboreModeChange={v => update('proLaboreMode', v)}
          onFixedCostsChange={v => update('fixedCosts', v)}
          onVariableCostsChange={v => update('variableCostRates', v)}
          onBelowEbitdaChange={v => update('belowEbitda', v)}
          onSociosChange={v => update('socios', v)}
        />

        <SectionROI
          data={state.investment}
          onChange={v => update('investment', v)}
          projections={projections}
          metaROIMeses={state.goals.metaROIMeses}
        />

        <SectionCharts projections={projections} investment={state.investment} />

        <SectionResults
          projections={projections}
          investment={state.investment}
          metaROIMeses={state.goals.metaROIMeses}
          churnMensal={state.churn.churnMensal}
        />

        <ActionButtons state={state} projections={projections} onReset={handleReset} onLoad={setState} />
      </div>
    </div>
  );
};

export default Simulador;
