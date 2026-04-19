import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  listenQuestoesPorMateria,
  listenQuestoesPorProjeto,
  atualizarQuestao,
} from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { calcSM2, isDue, isNew, shuffle } from '@/lib/sm2';
import { Questao } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type Modo = 'materia' | 'projeto' | 'questao';

const QUALITY_BUTTONS = [
  { quality: 0 as const, label: 'Errei', emoji: '😣', variant: 'destructive' as const },
  { quality: 1 as const, label: 'Difícil', emoji: '😓', variant: 'outline' as const },
  { quality: 3 as const, label: 'Bom', emoji: '🙂', variant: 'outline' as const },
  { quality: 5 as const, label: 'Fácil', emoji: '😄', variant: 'default' as const },
];

export default function Estudo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ projetoId?: string; materiaId?: string; questaoId?: string }>();

  const [fila, setFila] = useState<Questao[]>([]);
  const [index, setIndex] = useState(0);
  const [respondida, setRespondida] = useState(false);
  const [alternativaSelecionada, setAlternativaSelecionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [concluido, setConcluido] = useState(false);
  const [acertos, setAcertos] = useState(0);

  const modo: Modo = params.projetoId ? 'projeto' : params.questaoId ? 'questao' : 'materia';

  const buildFila = useCallback((questoes: Questao[]) => {
    const due = questoes.filter((q) => isDue(q.sm2));
    const shuffled = shuffle(due);
    setFila(shuffled);
    setLoading(false);
    if (shuffled.length === 0) setConcluido(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    if (modo === 'materia' && params.materiaId) {
      return listenQuestoesPorMateria(params.materiaId, buildFila);
    }

    if (modo === 'projeto' && params.projetoId) {
      return listenQuestoesPorProjeto(params.projetoId, buildFila);
    }

    if (modo === 'questao' && params.questaoId) {
      getDoc(doc(db, 'questoes', params.questaoId)).then((snap) => {
        if (snap.exists()) {
          setFila([{ id: snap.id, ...snap.data() } as Questao]);
        }
        setLoading(false);
      });
    }
  }, [user, modo, params.materiaId, params.projetoId, params.questaoId, buildFila]);

  const questaoAtual = fila[index];

  function handleAlternativa(letra: string) {
    if (respondida) return;
    setAlternativaSelecionada(letra);
    setRespondida(true);
    if (letra === questaoAtual.gabarito) setAcertos((a) => a + 1);
  }

  async function handleSM2(quality: 0 | 1 | 3 | 5) {
    const novoEstado = calcSM2(questaoAtual, quality);
    try {
      await atualizarQuestao(questaoAtual.id, { sm2: novoEstado });
    } catch {
      toast.error('Erro ao salvar progresso');
    }

    const next = index + 1;
    if (next >= fila.length) {
      setConcluido(true);
    } else {
      setIndex(next);
      setRespondida(false);
      setAlternativaSelecionada(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Carregando questões...</p>
      </div>
    );
  }

  if (concluido || fila.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <CheckCircle className="h-16 w-16 text-success mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Sessão concluída!</h2>
        <p className="text-muted-foreground mb-2">
          {fila.length === 0
            ? 'Nenhuma questão para revisar agora.'
            : `Você respondeu ${fila.length} questão(ões).`}
        </p>
        {fila.length > 0 && (
          <p className="text-muted-foreground text-sm mb-6">
            Acertos: <span className="text-success font-semibold">{acertos}</span> /{' '}
            {fila.length}
          </p>
        )}
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const letras = Object.keys(questaoAtual.alternativas) as Array<'A' | 'B' | 'C' | 'D' | 'E'>;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
            <span>Questão {index + 1} de {fila.length}</span>
            <span>{Math.round(((index) / fila.length) * 100)}%</span>
          </div>
          <Progress value={(index / fila.length) * 100} className="h-2" />
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {questaoAtual.banca && (
          <Badge variant="outline">{questaoAtual.banca}</Badge>
        )}
        {questaoAtual.ano && (
          <Badge variant="outline">{questaoAtual.ano}</Badge>
        )}
        {isNew(questaoAtual.sm2) && (
          <Badge variant="default">Nova</Badge>
        )}
      </div>

      {/* Enunciado */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {questaoAtual.enunciado}
          </p>
        </CardContent>
      </Card>

      {/* Alternativas */}
      <div className="space-y-2 mb-6">
        {letras.map((letra) => {
          const texto = questaoAtual.alternativas[letra];
          const isCorreta = letra === questaoAtual.gabarito;
          const isSelecionada = letra === alternativaSelecionada;

          let estilo = 'border-border bg-card text-foreground hover:border-primary/50';
          if (respondida) {
            if (isCorreta) estilo = 'border-success bg-success/10 text-foreground';
            else if (isSelecionada) estilo = 'border-destructive bg-destructive/10 text-foreground';
            else estilo = 'border-border bg-card text-muted-foreground opacity-60';
          }

          return (
            <button
              key={letra}
              className={cn(
                'w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                estilo,
                !respondida && 'cursor-pointer'
              )}
              onClick={() => handleAlternativa(letra)}
              disabled={respondida}
            >
              <span
                className={cn(
                  'font-bold text-sm shrink-0 w-5',
                  respondida && isCorreta && 'text-success',
                  respondida && isSelecionada && !isCorreta && 'text-destructive'
                )}
              >
                {letra}
              </span>
              <span className="text-sm">{texto}</span>
            </button>
          );
        })}
      </div>

      {/* Gabarito + Explicação */}
      {respondida && (
        <Card className="mb-6 border-border">
          <CardContent className="p-5">
            <p className="font-semibold text-sm mb-1">
              Gabarito:{' '}
              <span className="text-success">{questaoAtual.gabarito}</span>
            </p>
            {questaoAtual.explicacao && (
              <div
                className="rich-content text-muted-foreground text-sm mt-2 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: questaoAtual.explicacao }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Botões SM-2 */}
      {respondida && (
        <div>
          <p className="text-sm text-muted-foreground mb-3 text-center">Como foi?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUALITY_BUTTONS.map(({ quality, label, emoji }) => (
              <Button
                key={quality}
                variant={quality >= 3 ? 'default' : 'outline'}
                className={cn(
                  'flex flex-col h-auto py-3 gap-1',
                  quality === 0 && 'border-destructive text-destructive hover:bg-destructive hover:text-white',
                  quality === 5 && 'bg-success hover:bg-success/90 text-white border-0'
                )}
                onClick={() => handleSM2(quality)}
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
