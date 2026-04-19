import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Code2, Undo, Redo, Highlighter,
} from 'lucide-react';

const PRESET_COLORS = [
  '#ffffff', '#f87171', '#fb923c', '#fbbf24', '#a3e635',
  '#34d399', '#38bdf8', '#818cf8', '#e879f9', '#94a3b8',
  '#000000', '#dc2626', '#ea580c', '#ca8a04', '#4d7c0f',
  '#047857', '#0369a1', '#4338ca', '#7e22ce', '#475569',
];

const HIGHLIGHT_COLORS = [
  { color: '#fef08a', label: 'Amarelo' },
  { color: '#bbf7d0', label: 'Verde' },
  { color: '#bfdbfe', label: 'Azul' },
  { color: '#fecaca', label: 'Vermelho' },
  { color: '#e9d5ff', label: 'Roxo' },
];

const FONTS = [
  { label: 'Padrão', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
  { label: 'Times', value: '"Times New Roman", serif' },
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

interface TBtnProps {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function TBtn({ onClick, active, title, children, disabled }: TBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded text-xs transition-colors shrink-0',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        disabled && 'opacity-40 pointer-events-none'
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  minHeight = 120,
}: RichTextEditorProps) {
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const hlBtnRef = useRef<HTMLButtonElement>(null);
  const customColorRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      Underline,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync initial value when modal opens
  useEffect(() => {
    if (editor && value !== undefined) {
      const current = editor.getHTML();
      if (current !== value && value !== current) {
        editor.commands.setContent(value || '', false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  function toggleSource() {
    if (!editor) return;
    if (!showSource) {
      setSourceHtml(editor.getHTML());
    } else {
      editor.commands.setContent(sourceHtml);
      onChange(sourceHtml);
    }
    setShowSource((s) => !s);
  }

  const currentColor = editor.getAttributes('textStyle').color as string | undefined;

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/20 flex-wrap">

        {/* Formatação básica */}
        <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Sublinhado (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Riscado">
          <Strikethrough className="h-3.5 w-3.5" />
        </TBtn>

        <Divider />

        {/* Cor do texto */}
        <div className="relative">
          <button
            ref={colorBtnRef}
            type="button"
            title="Cor do texto"
            onClick={() => { setShowColorPicker((s) => !s); setShowHighlightPicker(false); }}
            className="h-7 px-1.5 flex flex-col items-center justify-center rounded hover:bg-accent transition-colors"
          >
            <span className="text-xs font-bold leading-none" style={{ color: currentColor || 'hsl(var(--foreground))' }}>A</span>
            <div className="w-4 h-1 rounded-sm mt-0.5" style={{ backgroundColor: currentColor || '#ffffff' }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg w-48">
              <div className="grid grid-cols-10 gap-1 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    className="w-4 h-4 rounded-sm border border-border/50 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom:</span>
                <input
                  ref={customColorRef}
                  type="color"
                  className="h-6 w-10 cursor-pointer rounded border-0 bg-transparent"
                  defaultValue={currentColor || '#ffffff'}
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive ml-auto"
                  onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                >
                  Remover
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Realce / Highlight */}
        <div className="relative">
          <button
            ref={hlBtnRef}
            type="button"
            title="Realçar texto"
            onClick={() => { setShowHighlightPicker((s) => !s); setShowColorPicker(false); }}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded transition-colors',
              editor.isActive('highlight')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Highlighter className="h-3.5 w-3.5" />
          </button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-2 bg-popover border border-border rounded-md shadow-lg flex gap-1.5">
              {HIGHLIGHT_COLORS.map(({ color, label }) => (
                <button
                  key={color}
                  type="button"
                  title={label}
                  className="w-5 h-5 rounded border border-border/50 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setShowHighlightPicker(false);
                  }}
                />
              ))}
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-destructive px-1"
                onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Fonte */}
        <select
          title="Família de fonte"
          className="h-7 text-xs bg-muted/30 border border-border rounded px-1 text-muted-foreground hover:bg-accent transition-colors cursor-pointer max-w-[80px]"
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(e.target.value).run();
            }
          }}
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value} className="bg-popover">
              {f.label}
            </option>
          ))}
        </select>

        <Divider />

        {/* Código inline */}
        <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Código inline">
          <Code className="h-3.5 w-3.5" />
        </TBtn>

        {/* Bloco de código */}
        <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Bloco de código">
          <Code2 className="h-3.5 w-3.5" />
        </TBtn>

        {/* Editar HTML fonte */}
        <TBtn onClick={toggleSource} active={showSource} title="Editar HTML fonte">
          <span className="font-mono font-bold text-[10px]">&lt;/&gt;</span>
        </TBtn>

        <Divider />

        {/* Undo / Redo */}
        <TBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)" disabled={!editor.can().undo()}>
          <Undo className="h-3.5 w-3.5" />
        </TBtn>
        <TBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)" disabled={!editor.can().redo()}>
          <Redo className="h-3.5 w-3.5" />
        </TBtn>
      </div>

      {/* ── Área de edição ─────────────────────────────────────────── */}
      {showSource ? (
        <textarea
          className="w-full p-3 text-xs font-mono bg-muted/10 text-foreground focus:outline-none resize-y"
          style={{ minHeight }}
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          placeholder="Cole ou edite o HTML aqui..."
          spellCheck={false}
        />
      ) : (
        <EditorContent
          editor={editor}
          className="rich-editor-content"
          style={{ minHeight }}
          onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); }}
        />
      )}
    </div>
  );
}
