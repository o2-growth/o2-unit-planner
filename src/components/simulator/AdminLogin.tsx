import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLogin() {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-white/80 flex items-center gap-1">
        <User className="h-3.5 w-3.5" />
        {profile.nome}
      </span>
      <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-white/60 hover:text-white hover:bg-white/10">
        <LogOut className="h-3.5 w-3.5" /> Sair
      </Button>
    </div>
  );
}
