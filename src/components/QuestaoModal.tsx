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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NovaQuestao } from '@/types';

interface QuestaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projetoId: string;
  cadernoId: string;
  materiaId: string;
  onSave: (q: NovaQuestao) => Promise<void>;
  initialData?: Partial<NovaQuestao>;
  title?: string;
}

const LETRAS = ['A', 'B', 'C', 'D', 'E'] as const;

export function QuestaoModal({
  open,
  onOpenChange,
  projetoId,
  cadernoId,
  materiaId,
  onSave,
  initialData,
  title = 'Nova Questão',
}: QuestaoModalProps) {
  const [enunciado, setEnunciado] = useState('');
  const [qtdAlternativas, setQtdAlternativas] = useState<4 | 5>(4);
  const [alternativas, setAlternativas] = useState<Record<string, string>>({});
  const [gabarito, setGabarito] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [explicacao, setExplicacao] = useState('');
  const [banca, setBanca] = useState('');
  const [ano, setAno] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEnunciado(initialData?.enunciado ?? '');
      setAlternativas(initialData?.alternativas ?? {});
      setGabarito(initialData?.gabarito ?? 'A');
      setExplicacao(initialData?.explicacao ?? '');
      setBanca(initialData?.banca ?? '');
      setAno(initialData?.ano ?? '');
      setQtdAlternativas(
        Object.keys(initialData?.alternativas ?? {}).length === 5 ? 5 : 4
      );
    }
  }, [open, initialData]);

  function setAlt(letra: string, value: string) {
    setAlternativas((prev) => ({ ...prev, [letra]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!enunciado.trim() || !gabarito) return;

    const alts: NovaQuestao['alternativas'] = {};
    LETRAS.slice(0, qtdAlternativas).forEach((l) => {
      if (alternativas[l]) alts[l] = alternativas[l];
    });

    setLoading(true);
    try {
      await onSave({
        projetoId,
        cadernoId,
        materiaId,
        enunciado: enunciado.trim(),
        alternativas: alts,
        gabarito,
        explicacao: explicacao.trim() || undefined,
        banca: banca.trim() || undefined,
        ano: ano.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  const letrasDisponiveis = LETRAS.slice(0, qtdAlternativas);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enunciado">Enunciado *</Label>
            <Textarea
              id="enunciado"
              value={enunciado}
              onChange={(e) => setEnunciado(e.target.value)}
              placeholder="Digite o enunciado da questão..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-4 items-center">
            <Label>Alternativas</Label>
            <Select
              value={String(qtdAlternativas)}
              onValueChange={(v) => setQtdAlternativas(Number(v) as 4 | 5)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 (A-D)</SelectItem>
                <SelectItem value="5">5 (A-E)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {letrasDisponiveis.map((letra) => (
              <div key={letra} className="flex items-center gap-3">
                <span className="font-bold text-primary w-5 shrink-0">{letra}</span>
                <Input
                  value={alternativas[letra] ?? ''}
                  onChange={(e) => setAlt(letra, e.target.value)}
                  placeholder={`Alternativa ${letra}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gabarito">Gabarito *</Label>
            <Select value={gabarito} onValueChange={(v) => setGabarito(v as typeof gabarito)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {letrasDisponiveis.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banca">Banca (opcional)</Label>
              <Input
                id="banca"
                value={banca}
                onChange={(e) => setBanca(e.target.value)}
                placeholder="Ex: CESPE"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano (opcional)</Label>
              <Input
                id="ano"
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ex: 2023"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explicacao">Explicação (opcional)</Label>
            <Textarea
              id="explicacao"
              value={explicacao}
              onChange={(e) => setExplicacao(e.target.value)}
              placeholder="Comentário ou explicação da questão..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!enunciado.trim() || loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
