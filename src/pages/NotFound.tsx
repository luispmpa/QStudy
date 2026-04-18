import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Página não encontrada</h2>
        <p className="text-muted-foreground mb-6">
          A página que você procura não existe.
        </p>
        <Button onClick={() => navigate('/')}>
          <Home className="h-4 w-4 mr-2" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
