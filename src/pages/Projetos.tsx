import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  listenProjetos,
  criarProjeto,
  renomearProjeto,
  excluirProjeto,
} from '@/lib/firestore';
import { Projeto } from '@/types';
import { PageHeader, EmptyState, LoadingGrid, EntityCard } from '@/components/Shared';
import { NamePromptDialog } from '@/components/NamePromptDialog';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function Projetos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Projeto | null>(null);

  useEffect(() => {
    if (!user) return;
    return listenProjetos(setProjetos);
  }, [user]);

  async function handleCreate(nome: string) {
    await criarProjeto(nome);
    toast.success('Projeto criado!');
  }

  async function handleRename(nome: string) {
    if (!renameTarget) return;
    await renomearProjeto(renameTarget.id, nome);
    toast.success('Projeto renomeado!');
    setRenameTarget(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir projeto e todos os dados? Esta ação é irreversível.')) return;
    await excluirProjeto(id);
    toast.success('Projeto excluído!');
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Organize seus estudos em projetos"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo projeto
          </Button>
        }
      />

      {projetos === null ? (
        <LoadingGrid />
      ) : projetos.length === 0 ? (
        <EmptyState
          icon={<FolderOpen />}
          title="Nenhum projeto ainda"
          description="Crie seu primeiro projeto para organizar seus cadernos e questões"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo projeto
            </Button>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((p) => (
            <EntityCard
              key={p.id}
              title={p.nome}
              subtitle={new Date(p.criadoEm).toLocaleDateString('pt-BR')}
              onClick={() => navigate(`/projetos/${p.id}`)}
              onRename={() => setRenameTarget(p)}
              onDelete={() => handleDelete(p.id)}
              onStudy={() => navigate(`/estudo/projeto/${p.id}`)}
            />
          ))}
        </div>
      )}

      <NamePromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Novo Projeto"
        placeholder="Nome do projeto..."
        onConfirm={handleCreate}
      />

      <NamePromptDialog
        open={!!renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        title="Renomear Projeto"
        placeholder="Novo nome..."
        initialValue={renameTarget?.nome}
        onConfirm={handleRename}
      />
    </div>
  );
}
