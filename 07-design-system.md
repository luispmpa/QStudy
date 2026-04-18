# Design System

Definido em `src/index.css` (tokens HSL) e `tailwind.config.ts` (mapeamento Tailwind).

## Princípios
- **Dark theme único** (sem alternância). `html` recebe `.dark` por padrão.
- **Mobile-first**, grids `sm:grid-cols-2 lg:grid-cols-3`.
- **Inspiração Anki/Notion**: superfícies escuras, bordas sutis, foco em tipografia.
- **Sem cores hardcoded** nos componentes — sempre tokens semânticos.

## Tokens principais (HSL)

| Token | Valor | Uso |
|-------|-------|-----|
| `--background` | `222 18% 8%` | fundo da app |
| `--foreground` | `210 20% 96%` | texto base |
| `--card` | `222 18% 11%` | cards, modais |
| `--primary` | `199 89% 56%` | azul vibrante (CTA, links) |
| `--primary-glow` | `199 89% 70%` | gradiente |
| `--muted` | `222 16% 14%` | secundárias |
| `--success` | `142 71% 45%` | alternativa correta |
| `--destructive` | `0 72% 55%` | alternativa errada / delete |
| `--warning` | `38 92% 55%` | "Para revisar" |
| `--border` | `222 16% 18%` | divisórias |
| `--sidebar-*` | sidebar tokens | navegação lateral |

## Gradientes e sombras

```css
--gradient-primary: linear-gradient(135deg, hsl(199 89% 56%), hsl(222 89% 65%));
--gradient-surface: linear-gradient(180deg, hsl(222 18% 11%), hsl(222 18% 9%));
--shadow-glow:    0 0 40px -10px hsl(199 89% 56% / 0.4);
--shadow-card:    0 4px 24px -6px hsl(0 0% 0% / 0.4);
```

Utilitários: `.gradient-primary`, `.shadow-glow`, `.shadow-card`, `.scrollbar-thin`, `.line-clamp-2`.

## Componentes shadcn usados
`Button`, `Card`, `Dialog`, `Input`, `Label`, `Select`, `Tabs`, `Progress`, `Tooltip`, `Toaster` (shadcn + sonner), `DropdownMenu`, `Badge`, `Separator`, `ScrollArea`, `Skeleton`.

## Estados padronizados (Shared.tsx)
- `LoadingGrid` — skeletons enquanto `items === null`.
- `EmptyState` — ícone + título + ação quando `items.length === 0`.
- `PageHeader` — título + descrição + ação (botão).
- `EntityCard` — card clicável com menu de ações (abrir / renomear / excluir).
