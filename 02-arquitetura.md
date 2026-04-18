# Arquitetura

## Estrutura de pastas

```
src/
├── App.tsx                  # Rotas + Providers (Query, Tooltip, Auth)
├── main.tsx                 # Bootstrap React
├── index.css                # Design system (HSL tokens, dark theme)
├── types.ts                 # Tipos do domínio (Projeto, Caderno, Materia, Questao)
│
├── contexts/
│   └── AuthContext.tsx      # onAuthStateChanged → { user, loading }
│
├── lib/
│   ├── firebase.ts          # initializeApp + auth + db
│   ├── firestore.ts         # CRUD + listeners (todas coleções)
│   ├── sm2.ts               # Algoritmo SM-2 + helpers (isDue, isNew, shuffle)
│   ├── pdfParser.ts         # Extração via pdfjs + parser regex
│   └── utils.ts             # cn() do shadcn
│
├── components/
│   ├── AppLayout.tsx        # Sidebar + Topbar + <Outlet/>
│   ├── Breadcrumbs.tsx      # Trilha hierárquica
│   ├── NavLink.tsx          # Item da sidebar
│   ├── NamePromptDialog.tsx # Modal genérico "criar/renomear"
│   ├── QuestaoModal.tsx     # Form completo de questão (criar/editar)
│   ├── Shared.tsx           # EntityCard, EmptyState, PageHeader, LoadingGrid
│   └── ui/                  # shadcn primitives
│
└── pages/
    ├── Auth.tsx             # Login / Cadastro
    ├── Dashboard.tsx        # Stats + atalhos
    ├── Projetos.tsx         # CRUD de projetos
    ├── Cadernos.tsx         # CRUD de cadernos do projeto
    ├── Materias.tsx         # CRUD de matérias do caderno
    ├── Questoes.tsx         # Lista + estudo da matéria
    ├── Estudo.tsx           # Modo flashcard (SM-2)
    ├── Importar.tsx         # PDF / Manual
    └── NotFound.tsx
```

## Fluxo de Providers (App.tsx)

```
QueryClientProvider
└── TooltipProvider
    ├── <Toaster />          (shadcn)
    ├── <Sonner />           (sonner)
    └── AuthProvider
        └── BrowserRouter
            └── Routes
                ├── /auth          → AuthPage
                └── Protected      → AppLayout (sidebar + outlet)
                    ├── /
                    ├── /projetos
                    ├── /projetos/:projetoId
                    ├── /projetos/:projetoId/cadernos/:cadernoId
                    ├── /projetos/:projetoId/cadernos/:cadernoId/materias/:materiaId
                    ├── /estudo/projeto/:projetoId
                    ├── /estudo/materia/:materiaId
                    ├── /estudo/questao/:questaoId
                    └── /importar
```

`Protected` redireciona para `/auth` quando `user` é nulo, preservando a rota original em `state.from`.

## Padrão de listagem real-time

Cada página usa um `useEffect` que registra um listener e retorna a função de unsubscribe:

```ts
useEffect(() => {
  if (!projetoId) return;
  return listenCadernos(projetoId, setItems);
}, [projetoId]);
```

`items === null` ⇒ skeleton; `items.length === 0` ⇒ empty state; senão grid.
