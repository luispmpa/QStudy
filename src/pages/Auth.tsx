import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erro desconhecido';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        toast.error('E-mail ou senha incorretos');
      } else if (msg.includes('email-already-in-use')) {
        toast.error('E-mail já cadastrado');
      } else if (msg.includes('weak-password')) {
        toast.error('Senha muito fraca (mín. 6 caracteres)');
      } else if (msg.includes('operation-not-allowed')) {
        toast.error('Login por e-mail não habilitado no Firebase');
      } else {
        toast.error('Erro: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">QStudy</h1>
              <p className="text-muted-foreground text-xs">Repetição espaçada para concursos</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? 'Entrar' : 'Criar conta'}</CardTitle>
            <CardDescription>
              {isLogin
                ? 'Acesse sua conta para continuar estudando'
                : 'Crie sua conta gratuita'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
