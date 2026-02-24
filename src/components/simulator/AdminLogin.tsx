import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLogin() {
  const { isAdmin, login, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (login(user, pass)) {
      setOpen(false);
      setUser('');
      setPass('');
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAdmin) {
    return (
      <Button variant="outline" size="sm" onClick={logout} className="gap-2">
        <Shield className="h-4 w-4" /> Admin ativo <LogOut className="h-3 w-3" />
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Shield className="h-4 w-4" /> Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Login Administrativo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Usuário</Label>
            <Input value={user} onChange={e => { setUser(e.target.value); setError(false); }} />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={pass} onChange={e => { setPass(e.target.value); setError(false); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <p className="text-sm text-destructive">Credenciais inválidas</p>}
          <Button onClick={handleLogin} className="w-full">Entrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
