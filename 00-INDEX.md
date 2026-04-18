# QStudy — Documentação Completa

Documentação técnica e funcional do **QStudy**, app de questões de concurso com repetição espaçada (SM-2), construído em React + Vite + Firebase.

## Sumário

1. [Visão Geral](01-visao-geral.md) — propósito, stack, características
2. [Arquitetura](02-arquitetura.md) — pastas, providers, padrão de listagem
3. [Modelo de Dados](03-modelo-de-dados.md) — coleções Firestore + índices
4. [Regras de Segurança](04-firestore-rules.md) — Firestore Security Rules
5. [Algoritmo SM-2](05-algoritmo-sm2.md) — repetição espaçada
6. [Importação por PDF](06-parser-pdf.md) — pdfjs + parser heurístico
7. [Design System](07-design-system.md) — tokens HSL, dark theme
8. [Fluxos de Uso](08-fluxos-de-uso.md) — passo a passo do usuário
9. [Setup e Deploy](09-setup-e-deploy.md) — local + GitHub Pages
10. [API interna (firestore.ts)](10-api-firestore.md) — funções CRUD
11. [Troubleshooting](11-troubleshooting.md) — erros comuns

## Configuração Firebase usada

```js
const firebaseConfig = {
  apiKey: "AIzaSyAbsR7_U4mCXGETXk5XQhTEbJ4scTMVRW0",
  authDomain: "questoes-67f9a.firebaseapp.com",
  projectId: "questoes-67f9a",
  storageBucket: "questoes-67f9a.firebasestorage.app",
  messagingSenderId: "602621734258",
  appId: "1:602621734258:web:31c269fc49739b72f8c1eb",
};
```

## Decisões-chave

- **Multi-user com isolamento**: `userId` em todo documento + Security Rules.
- **Coleções flat**: simplifica regras e cascade.
- **Real-time**: `onSnapshot` em todas as listagens.
- **Cascade delete via `writeBatch`**.
- **Cartas novas = `sm2: null`**, entram automaticamente na fila.
- **Dark theme único** com tokens HSL semânticos.

---

Gerado para o projeto QStudy. Stack: React 18 + Vite + TypeScript + Tailwind + Firebase + pdfjs-dist.
