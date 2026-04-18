import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listenProjetos, listenQuestoesPorProjeto } from '@/lib/firestore';
import { isDue, isNew } from '@/lib/sm2';
import { Projeto, Questao } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, BookOpen, Clock, Star, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [allQuestoes, setAllQuestoes] = useState<Questao[]>([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = listenProjetos((data) => {
      setProjetos(data);
      setLoadingProjetos(false);
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!projetos.length) return;
    const unsubs: (() => void)[] = [];
    const questoesPorProjeto: Record<string, Questao[]> = {};

    projetos.forEach((p) => {
      const unsub = listenQuestoesPorProjeto(p.id, (qs) => {
        questoesPorProjeto[p.id] = qs;
        setAllQuestoes(Object.values(questoesPorProjeto).flat());
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach((u) => u());
  }, [projetos]);

  const total = allQuestoes.length;
  const paraRevisar = allQuestoes.filter((q) => isDue(q.sm2) && !isNew(q.sm2)).length;
  const novas = allQuestoes.filter((q) => isNew(q.sm2)).length;
  const estudadas = allQuestoes.filter((q) => q.sm2 && q.sm2.repetitions > 0).length;

  const stats = [
    { label: 'Total de questões', value: total, icon: BookOpen, color: 'text-primary' },
    { label: 'Para revisar', value: paraRevisar, icon: Clock, color: 'text-warning' },
    { label: 'Questões novas', value: novas, icon: Star, color: 'text-success' },
    { label: 'Já estudadas', value: estudadas, icon: BookOpen, color: 'text-muted-foreground' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Olá{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aqui está um resumo do seu progresso de estudos.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Seus Projetos</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/projetos')}>
          Ver todos
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {loadingProjetos ? (
        <div className="text-muted-foreground text-sm">Carregando...</div>
      ) : projetos.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Nenhum projeto ainda</p>
            <p className="text-muted-foreground text-sm mb-4">Crie seu primeiro projeto para começar</p>
            <Button onClick={() => navigate('/projetos')}>Criar projeto</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.slice(0, 6).map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(`/projetos/${p.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/estudo/projeto/${p.id}`);
                  }}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Estudar agora
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
