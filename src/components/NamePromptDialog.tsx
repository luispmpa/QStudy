import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NamePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder?: string;
  initialValue?: string;
  onConfirm: (nome: string) => Promise<void> | void;
}

export function NamePromptDialog({
  open,
  onOpenChange,
  title,
  placeholder = 'Nome...',
  initialValue = '',
  onConfirm,
}: NamePromptDialogProps) {
  const [nome, setNome] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setNome(initialValue);
  }, [open, initialValue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setLoading(true);
    try {
      await onConfirm(nome.trim());
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-2">
            <Label htmlFor="nome" className="sr-only">Nome</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nome.trim() || loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
