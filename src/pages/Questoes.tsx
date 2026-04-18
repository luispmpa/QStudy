import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  listenQuestoesPorMateria,
  criarQuestao,
  excluirQuestao,
  listenProjetos,
  listenCadernos,
  listenMaterias,
} from '@/lib/firestore';
import { Questao, Projeto, Caderno, Materia, NovaQuestao } from '@/types';
import { formatNextReview, isDue, isNew } from '@/lib/sm2';
import { PageHeader, EmptyState, LoadingGrid } from '@/components/Shared';
import { QuestaoModal } from '@/components/QuestaoModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Plus, BookOpen, ChevronRight, MoreVertical, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function Questoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projetoId, cadernoId, materiaId } = useParams<{
    projetoId: string;
    cadernoId: string;
    materiaId: string;
  }>();

  const [questoes, setQuestoes] = useState<Questao[] | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [caderno, setCaderno] = useState<Caderno | null>(null);
  const [materia, setMateria] = useState<Materia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !materiaId) return;
    return listenQuestoesPorMateria(materiaId, setQuestoes);
  }, [user, materiaId]);

  useEffect(() => {
    if (!user || !projetoId) return;
    return listenProjetos((data) => {
      const found = data.find((p) => p.id === projetoId);
      if (found) setProjeto(found);
    });
  }, [user, projetoId]);

  useEffect(() => {
    if (!user || !projetoId || !cadernoId) return;
    return listenCadernos(projetoId, (data) => {
      const found = data.find((c) => c.id === cadernoId);
      if (found) setCaderno(found);
    });
  }, [user, projetoId, cadernoId]);

  useEffect(() => {
    if (!user || !cadernoId || !materiaId) return;
    return listenMaterias(cadernoId, (data) => {
      const found = data.find((m) => m.id === materiaId);
      if (found) setMateria(found);
    });
  }, [user, cadernoId, materiaId]);

  async function handleCreate(q: NovaQuestao) {
    await criarQuestao(q);
    toast.success('Questão criada!');
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir questão?')) return;
    await excluirQuestao(id);
    toast.success('Questão excluída!');
  }

  const due = questoes?.filter((q) => isDue(q.sm2)) ?? [];

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
        <Link to="/projetos" className="hover:text-foreground transition-colors">Projetos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/projetos/${projetoId}`} className="hover:text-foreground transition-colors">
          {projeto?.nome ?? '...'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/projetos/${projetoId}/cadernos/${cadernoId}`} className="hover:text-foreground transition-colors">
          {caderno?.nome ?? '...'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{materia?.nome ?? '...'}</span>
      </nav>

      <PageHeader
        title={materia?.nome ?? 'Questões'}
        description={`${questoes?.length ?? 0} questão(ões) · ${due.length} para estudar`}
        action={
          <div className="flex gap-2">
            {due.length > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate(`/estudo/materia/${materiaId}`)}
              >
                <Play className="h-4 w-4 mr-2" />
                Estudar ({due.length})
              </Button>
            )}
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova questão
            </Button>
          </div>
        }
      />

      {questoes === null ? (
        <LoadingGrid />
      ) : questoes.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="Nenhuma questão ainda"
          description="Adicione questões manualmente ou importe um PDF"
          action={
            <div className="flex gap-2">
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova questão
              </Button>
              <Button variant="outline" onClick={() => navigate('/importar')}>
                Importar PDF
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-3">
          {questoes.map((q) => (
            <Card
              key={q.id}
              className="hover:border-primary/40 transition-colors cursor-pointer"
              onClick={() => navigate(`/estudo/questao/${q.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{q.enunciado}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {q.banca && (
                        <Badge variant="outline" className="text-xs">{q.banca}</Badge>
                      )}
                      {q.ano && (
                        <Badge variant="outline" className="text-xs">{q.ano}</Badge>
                      )}
                      <Badge
                        variant={
                          isNew(q.sm2) ? 'default' :
                          isDue(q.sm2) ? 'warning' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {formatNextReview(q.sm2)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={() => navigate(`/estudo/questao/${q.id}`)}>
                        <Play className="h-4 w-4 mr-2" />
                        Estudar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(q.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projetoId && cadernoId && materiaId && (
        <QuestaoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projetoId={projetoId}
          cadernoId={cadernoId}
          materiaId={materiaId}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}
