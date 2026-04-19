export interface QuestaoHtmlParseada {
  enunciado: string;
  alternativas: { A?: string; B?: string; C?: string; D?: string; E?: string };
  gabarito: 'A' | 'B' | 'C' | 'D' | 'E' | null;
  explicacao?: string;
  banca?: string;
  ano?: string;
}

export function parseHtmlQuestoes(html: string): QuestaoHtmlParseada[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Gabaritos globais do script (para HTMLs de questão única)
  const gabaritosScript = extrairGabaritosScript(doc);

  const cards = doc.querySelectorAll('.card');

  if (cards.length === 0) {
    // HTML sem .card — tenta parsear o body inteiro como uma única questão
    const q = parseCard(doc.body, gabaritosScript[0] ?? null);
    return q ? [q] : [];
  }

  const questoes: QuestaoHtmlParseada[] = [];
  cards.forEach((card, i) => {
    const q = parseCard(card as HTMLElement, gabaritosScript[i] ?? null);
    if (q) questoes.push(q);
  });

  return questoes;
}

function extrairGabaritosScript(doc: Document): Array<'A' | 'B' | 'C' | 'D' | 'E'> {
  const result: Array<'A' | 'B' | 'C' | 'D' | 'E'> = [];
  doc.querySelectorAll('script').forEach((s) => {
    const matches = s.textContent?.matchAll(/var\s+gabarito\s*=\s*['"]([A-E])['"]/gi) ?? [];
    for (const m of matches) {
      result.push(m[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E');
    }
  });
  return result;
}

function parseCard(
  el: HTMLElement,
  gabaritoFallback: 'A' | 'B' | 'C' | 'D' | 'E' | null
): QuestaoHtmlParseada | null {
  // ── Enunciado ────────────────────────────────────────────────────────────
  const enunciadoEl = el.querySelector('.enunciado');
  const enunciado = enunciadoEl?.textContent?.trim() ?? '';
  if (!enunciado) return null;

  // ── Banca ─────────────────────────────────────────────────────────────────
  let banca = '';
  el.querySelectorAll('.tag').forEach((tag) => {
    if (tag.classList.contains('tag-ano')) return;
    const txt = tag.textContent?.trim();
    if (txt && !banca) banca = txt;
  });

  // ── Ano ───────────────────────────────────────────────────────────────────
  const ano = el.querySelector('.tag-ano')?.textContent?.trim() ?? '';

  // ── Alternativas ─────────────────────────────────────────────────────────
  const alternativas: Record<string, string> = {};
  el.querySelectorAll('.alt').forEach((alt) => {
    const letra = alt.querySelector('.alt-letra')?.textContent?.trim().toUpperCase();
    const texto = alt.querySelector('.alt-texto')?.textContent?.trim();
    if (letra && texto && /^[A-E]$/.test(letra)) {
      alternativas[letra] = texto;
    }
  });

  // ── Gabarito ─────────────────────────────────────────────────────────────
  let gabarito: 'A' | 'B' | 'C' | 'D' | 'E' | null = null;

  // 1) .gab-badge (mais confiável, presente mesmo com display:none)
  const gabEl = el.querySelector('.gab-badge');
  const gabMatch = gabEl?.textContent?.match(/Gabarito[:\s]+([A-E])/i);
  if (gabMatch) gabarito = gabMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';

  // 2) onclick="selecionar('X')" no próprio card
  if (!gabarito) {
    const onclickMatch = el.innerHTML.match(/selecionar\s*\(\s*['"]([A-E])['"]\s*\)/);
    if (onclickMatch) gabarito = onclickMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E';
  }

  // 3) Alternativa que já veio marcada como correta no HTML
  if (!gabarito) {
    const correta = el.querySelector('.alt.correta .alt-letra');
    const txt = correta?.textContent?.trim().toUpperCase();
    if (txt && /^[A-E]$/.test(txt)) gabarito = txt as 'A' | 'B' | 'C' | 'D' | 'E';
  }

  // 4) Fallback do script global
  if (!gabarito) gabarito = gabaritoFallback;

  // ── Explicação ────────────────────────────────────────────────────────────
  const comentarios = el.querySelectorAll('.comentario-bloco');
  let explicacaoHtml = '';

  if (comentarios.length > 0) {
    comentarios.forEach((bloco) => {
      const tituloEl = bloco.querySelector('.comentario-titulo');
      const textoEl = bloco.querySelector('.comentario-texto');
      if (!tituloEl || !textoEl) return;

      const titulo = tituloEl.textContent?.trim() ?? '';
      const textoHtml = textoEl.innerHTML ?? '';

      let cor = '#555555';
      if (tituloEl.classList.contains('ok')) cor = '#3B6D11';
      else if (tituloEl.classList.contains('err')) cor = '#A32D2D';
      else if (tituloEl.classList.contains('dica')) cor = '#185FA5';

      explicacaoHtml += `<p><strong style="color:${cor}">${titulo}</strong></p><p>${textoHtml}</p><br>`;
    });
  }

  return {
    enunciado,
    alternativas: alternativas as QuestaoHtmlParseada['alternativas'],
    gabarito,
    explicacao: explicacaoHtml.trim() || undefined,
    banca: banca || undefined,
    ano: ano || undefined,
  };
}
