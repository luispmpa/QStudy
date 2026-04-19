import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import {
  listenProjetos,
  listenCadernos,
  listenMaterias,
  criarQuestao,
  criarQuestoesEmLote,
} from '@/lib/firestore';
import { Projeto, Caderno, Materia, NovaQuestao } from '@/types';
import { extractTextFromPdf, parseQuestoes, QuestaoParseada } from '@/lib/pdfParser';
import { parseHtmlQuestoes, QuestaoHtmlParseada } from '@/lib/htmlParser';
import { PageHeader } from '@/components/Shared';
import { QuestaoModal } from '@/components/QuestaoModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Plus, AlertCircle, Code } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Importar() {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [projetoId, setProjetoId] = useState('');
  const [cadernoId, setCadernoId] = useState('');
  const [materiaId, setMateriaId] = useState('');

  const [questoesParseadas, setQuestoesParseadas] = useState<QuestaoParseada[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const [htmlInput, setHtmlInput] = useState('');
  const [htmlQuestoes, setHtmlQuestoes] = useState<QuestaoHtmlParseada[]>([]);
  const [savingHtml, setSavingHtml] = useState(false);
  const htmlFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    return listenProjetos(setProjetos);
  }, [user]);

  useEffect(() => {
    if (!projetoId) { setCadernos([]); setCadernoId(''); return; }
    return listenCadernos(projetoId, setCadernos);
  }, [projetoId]);

  useEffect(() => {
    if (!cadernoId) { setMaterias([]); setMateriaId(''); return; }
    return listenMaterias(cadernoId, setMaterias);
  }, [cadernoId]);

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      toast.error('Apenas arquivos PDF são suportados');
      return;
    }
    setProcessing(true);
    setProgress(10);
    try {
      const text = await extractTextFromPdf(file);
      setProgress(60);
      const parsed = parseQuestoes(text);
      setProgress(100);
      if (parsed.length === 0) {
        toast.warning('Nenhuma questão encontrada no PDF. Verifique o formato.');
      } else {
        setQuestoesParseadas(parsed);
        toast.success(`${parsed.length} questão(ões) encontrada(s)!`);
      }
    } catch (err) {
      toast.error('Erro ao processar PDF');
      console.error(err);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    []
  );

  function removeQuestao(idx: number) {
    setQuestoesParseadas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSalvarLote() {
    if (!projetoId || !cadernoId || !materiaId) {
      toast.error('Selecione Projeto, Caderno e Matéria');
      return;
    }
    const validas = questoesParseadas.filter((q) => q.gabarito !== null);
    if (validas.length === 0) {
      toast.error('Nenhuma questão com gabarito identificado');
      return;
    }

    setSaving(true);
    try {
      const novas: NovaQuestao[] = validas.map((q) => ({
        projetoId,
        cadernoId,
        materiaId,
        enunciado: q.enunciado,
        alternativas: q.alternativas as NovaQuestao['alternativas'],
        gabarito: q.gabarito as NovaQuestao['gabarito'],
        explicacao: q.explicacao,
        banca: q.banca,
        ano: q.ano,
      }));
      await criarQuestoesEmLote(novas);
      toast.success(`${novas.length} questão(ões) salva(s)!`);
      setQuestoesParseadas([]);
    } catch {
      toast.error('Erro ao salvar questões');
    } finally {
      setSaving(false);
    }
  }

  async function handleManualSave(q: NovaQuestao) {
    await criarQuestao(q);
    toast.success('Questão criada!');
    setManualOpen(false);
  }

  function handleParseHtml() {
    const html = htmlInput.trim();
    if (!html) { toast.error('Cole o HTML antes de processar'); return; }
    const parsed = parseHtmlQuestoes(html);
    if (parsed.length === 0) {
      toast.warning('Nenhuma questão encontrada no HTML. Verifique o formato.');
    } else {
      setHtmlQuestoes(parsed);
      toast.success(`${parsed.length} questão(ões) encontrada(s)!`);
    }
  }

  function handleHtmlFile(file: File) {
    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Selecione um arquivo HTML (.html ou .htm)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setHtmlInput(text);
      const parsed = parseHtmlQuestoes(text);
      if (parsed.length === 0) {
        toast.warning('Nenhuma questão encontrada no HTML.');
      } else {
        setHtmlQuestoes(parsed);
        toast.success(`${parsed.length} questão(ões) encontrada(s)!`);
      }
    };
    reader.readAsText(file);
  }

  function removeHtmlQuestao(idx: number) {
    setHtmlQuestoes((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSalvarHtmlLote() {
    if (!projetoId || !cadernoId || !materiaId) {
      toast.error('Selecione Projeto, Caderno e Matéria');
      return;
    }
    const validas = htmlQuestoes.filter((q) => q.gabarito !== null);
    if (validas.length === 0) {
      toast.error('Nenhuma questão com gabarito identificado');
      return;
    }
    setSavingHtml(true);
    try {
      const novas: NovaQuestao[] = validas.map((q) => ({
        projetoId,
        cadernoId,
        materiaId,
        enunciado: q.enunciado,
        alternativas: q.alternativas as NovaQuestao['alternativas'],
        gabarito: q.gabarito as NovaQuestao['gabarito'],
        explicacao: q.explicacao,
        banca: q.banca,
        ano: q.ano,
      }));
      await criarQuestoesEmLote(novas);
      toast.success(`${novas.length} questão(ões) salva(s)!`);
      setHtmlQuestoes([]);
      setHtmlInput('');
    } catch {
      toast.error('Erro ao salvar questões');
    } finally {
      setSavingHtml(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Importar Questões"
        description="Importe questões de um PDF ou adicione manualmente"
      />

      {/* Seleção de destino */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-foreground mb-3">Destino das questões</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Projeto</Label>
              <Select value={projetoId} onValueChange={setProjetoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {projetos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Caderno</Label>
              <Select value={cadernoId} onValueChange={setCadernoId} disabled={!projetoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {cadernos.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Matéria</Label>
              <Select value={materiaId} onValueChange={setMateriaId} disabled={!cadernoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {materias.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pdf">
        <TabsList>
          <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
          <TabsTrigger value="html">Import HTML</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-4">
          {/* Drop zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer',
              dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">
              Arraste um PDF aqui ou clique para selecionar
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Padrão QConcursos / TecConcursos (Questão N, Gabarito: X)
            </p>
          </div>

          {processing && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Processando PDF...</p>
              <Progress value={progress} />
            </div>
          )}

          {/* Preview */}
          {questoesParseadas.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-foreground">
                  {questoesParseadas.length} questão(ões) encontrada(s)
                </p>
                <Button
                  onClick={handleSalvarLote}
                  disabled={saving || !projetoId || !cadernoId || !materiaId}
                >
                  {saving ? 'Salvando...' : `Salvar todas (${questoesParseadas.filter(q => q.gabarito).length})`}
                </Button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {questoesParseadas.map((q, idx) => (
                  <Card key={idx} className={cn(!q.gabarito && 'border-warning/50')}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {q.banca && <Badge variant="outline" className="text-xs">{q.banca}</Badge>}
                            {q.ano && <Badge variant="outline" className="text-xs">{q.ano}</Badge>}
                            {q.gabarito ? (
                              <Badge variant="success" className="text-xs">Gabarito: {q.gabarito}</Badge>
                            ) : (
                              <Badge variant="warning" className="text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Sem gabarito
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{q.enunciado}</p>
                          <div className="mt-2 space-y-0.5">
                            {Object.entries(q.alternativas).map(([l, t]) => (
                              <p key={l} className="text-xs text-muted-foreground">
                                <span className="font-medium">{l})</span> {t}
                              </p>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeQuestao(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="html" className="mt-4">
          <Card className="mb-4">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Cole o HTML ou carregue um arquivo</p>
                <div className="flex gap-2">
                  <input
                    ref={htmlFileRef}
                    type="file"
                    accept=".html,.htm"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHtmlFile(f); }}
                  />
                  <Button variant="outline" size="sm" onClick={() => htmlFileRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Arquivo HTML
                  </Button>
                  <Button size="sm" onClick={handleParseHtml} disabled={!htmlInput.trim()}>
                    <Code className="h-3.5 w-3.5 mr-1.5" />
                    Processar
                  </Button>
                </div>
              </div>
              <textarea
                className="w-full h-40 text-xs font-mono bg-muted/20 border border-border rounded p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                placeholder="Cole aqui o HTML copiado do QConcursos, TecConcursos etc."
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground">
                Compatível com: QConcursos, TecConcursos e outros sites que usam <code>.card</code> / <code>.enunciado</code> / <code>.alt</code>
              </p>
            </CardContent>
          </Card>

          {htmlQuestoes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-foreground">
                  {htmlQuestoes.length} questão(ões) encontrada(s)
                </p>
                <Button
                  onClick={handleSalvarHtmlLote}
                  disabled={savingHtml || !projetoId || !cadernoId || !materiaId}
                >
                  {savingHtml ? 'Salvando...' : `Salvar todas (${htmlQuestoes.filter(q => q.gabarito).length})`}
                </Button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {htmlQuestoes.map((q, idx) => (
                  <Card key={idx} className={cn(!q.gabarito && 'border-warning/50')}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {q.banca && <Badge variant="outline" className="text-xs">{q.banca}</Badge>}
                            {q.ano && <Badge variant="outline" className="text-xs">{q.ano}</Badge>}
                            {q.gabarito ? (
                              <Badge variant="success" className="text-xs">Gabarito: {q.gabarito}</Badge>
                            ) : (
                              <Badge variant="warning" className="text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Sem gabarito
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{q.enunciado}</p>
                          <div className="mt-2 space-y-0.5">
                            {Object.entries(q.alternativas).map(([l, t]) => (
                              <p key={l} className="text-xs text-muted-foreground">
                                <span className="font-medium">{l})</span> {t}
                              </p>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeHtmlQuestao(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Adicionar questão manualmente</p>
              <p className="text-muted-foreground text-sm mb-4">
                Use o formulário para criar uma questão detalhada com alternativas e gabarito
              </p>
              <Button
                onClick={() => {
                  if (!projetoId || !cadernoId || !materiaId) {
                    toast.error('Selecione Projeto, Caderno e Matéria primeiro');
                    return;
                  }
                  setManualOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova questão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {projetoId && cadernoId && materiaId && (
        <QuestaoModal
          open={manualOpen}
          onOpenChange={setManualOpen}
          projetoId={projetoId}
          cadernoId={cadernoId}
          materiaId={materiaId}
          onSave={handleManualSave}
        />
      )}
    </div>
  );
}
