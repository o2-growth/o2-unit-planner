import { Button } from '@/components/ui/button';
import { Save, RotateCcw, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatCurrency } from '@/lib/formatters';
import { exportPDF } from '@/lib/exportPdf';
import { exportExcel } from '@/lib/exportExcel';

interface Props {
  state: SimulatorState;
  projections: MonthlyProjection[];
  onReset: () => void;
  onLoad: (state: SimulatorState) => void;
}

export function ActionButtons({ state, projections, onReset, onLoad }: Props) {
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      localStorage.setItem('o2-simulator', JSON.stringify(state));
      toast({ title: 'Simulação salva localmente!' });
      return;
    }

    const { data: existing } = await supabase
      .from('simulations')
      .select('id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      await supabase
        .from('simulations')
        .update({ state: state as any, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('simulations')
        .insert({ user_id: user.id, state: state as any });
    }

    localStorage.setItem('o2-simulator', JSON.stringify(state));
    toast({ title: 'Simulação salva!', description: 'Dados salvos no servidor.' });
  };

  const handleLoad = async () => {
    if (!user) {
      const saved = localStorage.getItem('o2-simulator');
      if (saved) {
        onLoad(JSON.parse(saved));
        toast({ title: 'Simulação carregada!' });
      } else {
        toast({ title: 'Nenhuma simulação salva', variant: 'destructive' });
      }
      return;
    }

    const { data } = await supabase
      .from('simulations')
      .select('state')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data?.state) {
      onLoad(data.state as unknown as SimulatorState);
      toast({ title: 'Simulação carregada!', description: 'Dados restaurados do servidor.' });
    } else {
      toast({ title: 'Nenhuma simulação salva', variant: 'destructive' });
    }
  };

  const handleExportPDF = async () => {
    await exportPDF(state, projections);
    toast({ title: 'PDF exportado!' });
  };

  const handleExportExcel = async () => {
    await exportExcel(state, projections);
    toast({ title: 'Excel exportado!', description: '3 abas: DRE, MRR e ROI.' });
  };

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleSave} variant="outline">
          <Save className="mr-2 h-4 w-4" /> Salvar Simulação
        </Button>
        <Button onClick={handleLoad} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Carregar Simulação
        </Button>
        <Button onClick={onReset} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Resetar Premissas
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleExportPDF} className="bg-primary">
          <FileText className="mr-2 h-4 w-4" /> Exportar PDF
        </Button>
        <Button onClick={handleExportExcel} className="bg-primary">
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
        </Button>
      </div>
    </div>
  );
}
