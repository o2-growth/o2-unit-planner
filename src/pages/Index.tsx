import { useState, useMemo, useCallback } from 'react';
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

const Index = () => {
  const [state, setState] = useState<SimulatorState>(() => {
    const saved = localStorage.getItem('o2-simulator');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backward compat: ensure new fields exist
        if (!parsed.investment?.cupom) {
          parsed.investment = { ...INITIAL_STATE.investment, ...parsed.investment };
        }
        if (parsed.commercial?.mix?.setup !== undefined) {
          const { setup, ...rest } = parsed.commercial.mix;
          parsed.commercial.mix = rest;
        }
        return parsed;
      } catch { /* ignore */ }
    }
    return { ...INITIAL_STATE };
  });

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="o2-gradient py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Simulador Financeiro
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              O2 Inc. — Franquias
            </p>
          </div>
          <AdminLogin />
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

        {/* Section 2 - Transition */}
        <Card className="border-primary bg-accent/50">
          <CardContent className="py-8 text-center">
            <p className="text-lg font-semibold text-primary italic">
              "Muito obrigado por suas respostas, agora você está apto a montar o BP da sua unidade."
            </p>
          </CardContent>
        </Card>

        {/* Section 3 - Goals */}
        <SectionGoals data={state.goals} onChange={v => update('goals', v)} />

        {/* Transition message */}
        <Card className="border-primary bg-accent/50">
          <CardContent className="py-6 text-center">
            <p className="text-lg font-semibold text-primary italic">
              "Excelente. Bora para os números."
            </p>
          </CardContent>
        </Card>

        {/* Section 4 - Horizon */}
        <SectionHorizon value={state.horizonte} onChange={v => update('horizonte', v)} />

        {/* Section 5 - Commercial */}
        <SectionCommercial data={state.commercial} onChange={v => update('commercial', v)} />

        {/* Section 6 - Matrix Clients */}
        <SectionMatrixClients data={state.matrixClients} onChange={v => update('matrixClients', v)} />

        {/* Section 7 - Churn (simplified) */}
        <SectionChurn
          churnMensal={state.churn.churnMensal}
          onChangeChurn={v => update('churn', { churnMensal: v })}
        />

        {/* Section 8 - Taxes */}
        <SectionTaxes data={state.taxes} onChange={v => update('taxes', v)} />

        {/* Section 9 - Revenue Rules (admin-locked) */}
        <SectionRevenueRules data={state.revenueRules} onChange={v => update('revenueRules', v)} />

        {/* Premissas Header (editable quick-access) */}
        <PremissasHeader state={state} onUpdate={update} />

        {/* Section 10 - P&L */}
        <SectionPL
          projections={projections}
          fixedCosts={state.fixedCosts}
          variableCostRates={state.variableCostRates}
          belowEbitda={state.belowEbitda}
          onFixedCostsChange={v => update('fixedCosts', v)}
          onVariableCostsChange={v => update('variableCostRates', v)}
          onBelowEbitdaChange={v => update('belowEbitda', v)}
        />

        {/* Section 11 - ROI */}
        <SectionROI
          data={state.investment}
          onChange={v => update('investment', v)}
          projections={projections}
          metaROIMeses={state.goals.metaROIMeses}
        />

        {/* Section 13 - Charts */}
        <SectionCharts projections={projections} investment={state.investment} />

        {/* Section 14 - Results */}
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
