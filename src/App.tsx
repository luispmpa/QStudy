import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import AuthPage from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Projetos from '@/pages/Projetos';
import Cadernos from '@/pages/Cadernos';
import Materias from '@/pages/Materias';
import Questoes from '@/pages/Questoes';
import Estudo from '@/pages/Estudo';
import Importar from '@/pages/Importar';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors position="top-right" />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                element={
                  <Protected>
                    <AppLayout />
                  </Protected>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="projetos" element={<Projetos />} />
                <Route path="projetos/:projetoId" element={<Cadernos />} />
                <Route
                  path="projetos/:projetoId/cadernos/:cadernoId"
                  element={<Materias />}
                />
                <Route
                  path="projetos/:projetoId/cadernos/:cadernoId/materias/:materiaId"
                  element={<Questoes />}
                />
                <Route path="estudo/projeto/:projetoId" element={<Estudo />} />
                <Route path="estudo/materia/:materiaId" element={<Estudo />} />
                <Route path="estudo/questao/:questaoId" element={<Estudo />} />
                <Route path="importar" element={<Importar />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
