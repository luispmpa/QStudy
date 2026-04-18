import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface QuestaoParseada {
  enunciado: string;
  alternativas: { A?: string; B?: string; C?: string; D?: string; E?: string };
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  explicacao?: string;
  banca?: string;
  ano?: string;
}

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n');
}

export function parseQuestoes(text: string): QuestaoParseada[] {
  const blocos = text.split(/questão\s+\d+/gi).filter((b) => b.trim().length > 20);
  return blocos.map(parseBloco).filter(Boolean) as QuestaoParseada[];
}

function parseBloco(bloco: string): QuestaoParseada | null {
  const linhas = bloco.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const alternativaRegex = /^\s*([A-E])[\)\.\s\-]+(.+)$/;
  const gabaritoRegex = /(?:gabarito|resposta)[:\-]?\s*([A-E])/i;
  const comentarioRegex = /(?:comentário|explicação)[:\s]/i;
  const bancaAnoRegex = /\(([A-Z\s\/\-]+)\).*?(\d{4})/i;

  const enunciadoLinhas: string[] = [];
  const alternativas: { A?: string; B?: string; C?: string; D?: string; E?: string } = {};
  let gabarito: 'A' | 'B' | 'C' | 'D' | 'E' | null = null;
  let explicacao = '';
  let banca: string | undefined;
  let ano: string | undefined;
  let modoComentario = false;

  for (const linha of linhas) {
    if (gabaritoRegex.test(linha)) {
      const m = linha.match(gabaritoRegex);
      if (m) gabarito = m[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      continue;
    }

    if (comentarioRegex.test(linha)) {
      modoComentario = true;
      const after = linha.replace(comentarioRegex, '').trim();
      if (after) explicacao += after + ' ';
      continue;
    }

    if (modoComentario) {
      explicacao += linha + ' ';
      continue;
    }

    const altMatch = linha.match(alternativaRegex);
    if (altMatch) {
      const letra = altMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
      alternativas[letra] = altMatch[2].trim();
      continue;
    }

    if (Object.keys(alternativas).length === 0) {
      const bancaMatch = linha.match(bancaAnoRegex);
      if (bancaMatch) {
        banca = bancaMatch[1].trim();
        ano = bancaMatch[2];
      }
      enunciadoLinhas.push(linha);
    }
  }

  const enunciado = enunciadoLinhas.join(' ').trim();
  if (!enunciado) return null;

  return {
    enunciado,
    alternativas,
    gabarito,
    explicacao: explicacao.trim() || undefined,
    banca,
    ano,
  };
}
