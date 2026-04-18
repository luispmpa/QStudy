import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  listenMaterias,
  criarMateria,
  renomearMateria,
  excluirMateria,
  listenProjetos,
  listenCadernos,
} from '@/lib/firestore';
import { Materia, Projeto, Caderno } from '@/types';
import { PageHeader, EmptyState, LoadingGrid, EntityCard } from '@/components/Shared';
import { NamePromptDialog } from '@/components/NamePromptDialog';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Materias() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projetoId, cadernoId } = useParams<{ projetoId: string; cadernoId: string }>();
  const [materias, setMaterias] = useState<Materia[] | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [caderno, setCaderno] = useState<Caderno | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Materia | null>(null);

  useEffect(() => {
    if (!user || !cadernoId) return;
    return listenMaterias(cadernoId, setMaterias);
  }, [user, cadernoId]);

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

  async function handleCreate(nome: string) {
    if (!projetoId || !cadernoId) return;
    await criarMateria(projetoId, cadernoId, nome);
    toast.success('Matéria criada!');
  }

  async function handleRename(nome: string) {
    if (!renameTarget) return;
    await renomearMateria(renameTarget.id, nome);
    toast.success('Matéria renomeada!');
    setRenameTarget(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir matéria e todas as questões? Esta ação é irreversível.')) return;
    await excluirMateria(id);
    toast.success('Matéria excluída!');
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4 flex-wrap">
        <Link to="/projetos" className="hover:text-foreground transition-colors">Projetos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/projetos/${projetoId}`} className="hover:text-foreground transition-colors">
          {projeto?.nome ?? '...'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{caderno?.nome ?? '...'}</span>
      </nav>

      <PageHeader
        title="Matérias"
        description={`Matérias do caderno "${caderno?.nome ?? ''}"`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova matéria
          </Button>
        }
      />

      {materias === null ? (
        <LoadingGrid />
      ) : materias.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="Nenhuma matéria ainda"
          description="Crie matérias para organizar as questões"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova matéria
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((m) => (
            <EntityCard
              key={m.id}
              title={m.nome}
              subtitle={new Date(m.criadoEm).toLocaleDateString('pt-BR')}
              onClick={() =>
                navigate(`/projetos/${projetoId}/cadernos/${cadernoId}/materias/${m.id}`)
              }
              onRename={() => setRenameTarget(m)}
              onDelete={() => handleDelete(m.id)}
              onStudy={() => navigate(`/estudo/materia/${m.id}`)}
            />
          ))}
        </div>
      )}

      <NamePromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nova Matéria"
        placeholder="Nome da matéria..."
        onConfirm={handleCreate}
      />

      <NamePromptDialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        title="Renomear Matéria"
        placeholder="Novo nome..."
        initialValue={renameTarget?.nome}
        onConfirm={handleRename}
      />
    </div>
  );
}
