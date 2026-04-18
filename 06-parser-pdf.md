# Importação por PDF

Arquivo: `src/lib/pdfParser.ts`. Página: `src/pages/Importar.tsx`.

## Pipeline

1. **Drag & drop** ou input de arquivo `.pdf`.
2. `pdfjs-dist` carrega o documento (`getDocument`) e itera todas as páginas.
3. Para cada página, concatena `item.str` de `getTextContent()` em uma string com quebras.
4. **Parser heurístico** quebra o texto em blocos por marcador `Questão N` (case-insensitive) e, dentro de cada bloco, identifica:
   - **Enunciado**: tudo antes da primeira alternativa.
   - **Alternativas**: regex `/^\s*([A-E])[\)\.\s-]+(.+)$/m` em modo multiline.
   - **Gabarito**: `Gabarito[:\-]?\s*([A-E])` ou `Resposta[:\-]?\s*([A-E])`.
   - **Comentário/Explicação**: bloco após `Comentário:` / `Explicação:` até a próxima `Questão` ou EOF.
   - **Banca / Ano** (opcional): regex sobre cabeçalho típico (`(BANCA) ... (ANO)`).
5. **Preview**: questões detectadas são exibidas em cards com botão "remover" individual antes de salvar.
6. **Destino**: o usuário seleciona Projeto / Caderno / Matéria.
7. **Salvamento em lote**: `criarQuestoesEmLote(qs)` usa `writeBatch` para um único commit.

## Padrões suportados

Funciona bem com extrações típicas de:
- **QConcursos** (`Questão 1`, `Gabarito: A`, `Comentário:`)
- **TecConcursos** (formato similar com `Resposta: A`)

## Limitações conhecidas

- PDFs **escaneados** (imagem) não geram texto via `pdfjs` — exigiriam OCR (não incluído).
- Layouts de duas colunas podem misturar a ordem do texto.
- O parser ignora questões sem gabarito identificado e marca como aviso no preview.

## Fallback manual

A aba **Manual** abre o `QuestaoModal` (mesmo componente do CRUD) para criar uma questão por vez, garantindo cobertura quando o PDF falha.
