import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  listenCadernos,
  criarCaderno,
  renomearCaderno,
  excluirCaderno,
  listenProjetos,
} from '@/lib/firestore';
import { Caderno, Projeto } from '@/types';
import { PageHeader, EmptyState, LoadingGrid, EntityCard } from '@/components/Shared';
import { NamePromptDialog } from '@/components/NamePromptDialog';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Cadernos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projetoId } = useParams<{ projetoId: string }>();
  const [cadernos, setCadernos] = useState<Caderno[] | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Caderno | null>(null);

  useEffect(() => {
    if (!user || !projetoId) return;
    return listenCadernos(projetoId, setCadernos);
  }, [user, projetoId]);

  useEffect(() => {
    if (!user) return;
    return listenProjetos((data) => {
      const found = data.find((p) => p.id === projetoId);
      if (found) setProjeto(found);
    });
  }, [user, projetoId]);

  async function handleCreate(nome: string) {
    if (!projetoId) return;
    await criarCaderno(projetoId, nome);
    toast.success('Caderno criado!');
  }

  async function handleRename(nome: string) {
    if (!renameTarget) return;
    await renomearCaderno(renameTarget.id, nome);
    toast.success('Caderno renomeado!');
    setRenameTarget(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir caderno e todas as matérias e questões? Esta ação é irreversível.')) return;
    await excluirCaderno(id);
    toast.success('Caderno excluído!');
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link to="/projetos" className="hover:text-foreground transition-colors">Projetos</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{projeto?.nome ?? '...'}</span>
      </nav>

      <PageHeader
        title="Cadernos"
        description={`Cadernos do projeto "${projeto?.nome ?? ''}"`}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo caderno
          </Button>
        }
      />

      {cadernos === null ? (
        <LoadingGrid />
      ) : cadernos.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="Nenhum caderno ainda"
          description="Crie cadernos para organizar as matérias"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo caderno
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cadernos.map((c) => (
            <EntityCard
              key={c.id}
              title={c.nome}
              subtitle={new Date(c.criadoEm).toLocaleDateString('pt-BR')}
              onClick={() => navigate(`/projetos/${projetoId}/cadernos/${c.id}`)}
              onRename={() => setRenameTarget(c)}
              onDelete={() => handleDelete(c.id)}
            />
          ))}
        </div>
      )}

      <NamePromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Novo Caderno"
        placeholder="Nome do caderno..."
        onConfirm={handleCreate}
      />

      <NamePromptDialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        title="Renomear Caderno"
        placeholder="Novo nome..."
        initialValue={renameTarget?.nome}
        onConfirm={handleRename}
      />
    </div>
  );
}
