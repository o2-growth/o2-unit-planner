import { Button } from '@/components/ui/button';
import { Save, RotateCcw, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatCurrency } from '@/lib/formatters';
import { exportPDF } from '@/lib/exportPdf';

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
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(projections.map(p => ({
      Mês: p.month,
      'Receita Bruta': p.receitaBrutaTotal,
      'Receita Líquida': p.receitaLiquida,
      'Lucro Bruto': p.lucroBruto,
      'EBITDA': p.ebitda,
      'Resultado Final': p.resultadoFinal,
      'MRR Final': p.mrrTotal,
      'Churn R$': p.churnValor,
      'Clientes Comprados': p.clientesCompradosMes,
      'Clientes Acum.': p.clientesCompradosAcum,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projeção');
    XLSX.writeFile(wb, 'simulacao-o2.xlsx');
    toast({ title: 'Excel exportado!' });
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center py-6">
      <Button onClick={handleSave} variant="outline">
        <Save className="mr-2 h-4 w-4" /> Salvar Simulação
      </Button>
      <Button onClick={handleLoad} variant="outline">
        <Download className="mr-2 h-4 w-4" /> Carregar Simulação
      </Button>
      <Button onClick={onReset} variant="outline">
        <RotateCcw className="mr-2 h-4 w-4" /> Resetar Premissas
      </Button>
      <Button onClick={handleExportPDF} className="bg-primary">
        <FileText className="mr-2 h-4 w-4" /> Exportar PDF
      </Button>
      <Button onClick={handleExportExcel} className="bg-primary">
        <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar Excel
      </Button>
    </div>
  );
}
