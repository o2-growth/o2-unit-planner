import { Button } from '@/components/ui/button';
import { Save, RotateCcw, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { SimulatorState, MonthlyProjection } from '@/types/simulator';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface Props {
  state: SimulatorState;
  projections: MonthlyProjection[];
  onReset: () => void;
  onLoad: (state: SimulatorState) => void;
}

export function ActionButtons({ state, projections, onReset, onLoad }: Props) {
  const handleSave = () => {
    localStorage.setItem('o2-simulator', JSON.stringify(state));
    toast({ title: 'Simulação salva!', description: 'Dados armazenados no navegador.' });
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('o2-simulator');
    if (saved) {
      onLoad(JSON.parse(saved));
      toast({ title: 'Simulação carregada!', description: 'Dados restaurados com sucesso.' });
    } else {
      toast({ title: 'Nenhuma simulação salva', variant: 'destructive' });
    }
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF('landscape', 'mm', 'a4') as any;
    doc.setFontSize(18);
    doc.text('Simulador Financeiro - O2 Inc.', 14, 20);
    doc.setFontSize(10);
    doc.text(`Nome: ${state.profile.nome}`, 14, 30);
    doc.text(`Horizonte: ${state.horizonte} meses`, 14, 36);

    const headers = ['Mês', 'Rec. Bruta', 'Rec. Líquida', 'Lucro Bruto', 'EBITDA', 'Res. Final', 'MRR Final'];
    const rows = projections.map(p => [
      p.month,
      formatCurrency(p.receitaBrutaTotal),
      formatCurrency(p.receitaLiquida),
      formatCurrency(p.lucroBruto),
      formatCurrency(p.ebitda),
      formatCurrency(p.resultadoFinal),
      formatCurrency(p.mrrTotal),
    ]);

    doc.autoTable({
      startY: 42,
      head: [headers],
      body: rows,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 120, 60] },
    });

    doc.save('simulacao-o2.pdf');
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
        <Save className="mr-2 h-4 w-4" /> Carregar Simulação
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
