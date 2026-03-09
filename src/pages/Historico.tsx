import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Play, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SimRow {
  id: string;
  nome: string;
  updated_at: string;
  is_active: boolean;
  state: any;
}

export default function Historico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sims, setSims] = useState<SimRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('simulations')
      .select('id, nome, updated_at, is_active, state')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setSims((data as unknown as SimRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleActivate = async (id: string) => {
    if (!user) return;
    // Deactivate all
    await supabase.from('simulations').update({ is_active: false } as any).eq('user_id', user.id);
    // Activate chosen
    await supabase.from('simulations').update({ is_active: true } as any).eq('id', id);
    navigate('/simulador');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('simulations').delete().eq('id', id);
    setSims(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (sims.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground/40" />
        <h2 className="text-xl font-semibold text-foreground">Nenhuma simulação encontrada</h2>
        <p className="text-muted-foreground">Crie sua primeira simulação no Simulador.</p>
        <Button onClick={() => navigate('/simulador')}>Ir para o Simulador</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {sims.map(sim => {
        const profileNome = sim.state?.profile?.nome;
        return (
          <Card key={sim.id} className={sim.is_active ? 'border-primary/50 bg-accent/30' : ''}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{sim.nome}</h3>
                  {sim.is_active && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      Ativa
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profileNome && <span>{profileNome} · </span>}
                  Atualizada em {format(new Date(sim.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!sim.is_active && (
                  <Button variant="outline" size="sm" onClick={() => handleActivate(sim.id)} className="gap-1">
                    <Play className="h-3.5 w-3.5" /> Continuar
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(sim.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
