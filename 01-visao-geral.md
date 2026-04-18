# QStudy — Visão Geral

QStudy é uma SPA (Single Page Application) para estudo de **questões de concurso público** com **repetição espaçada** baseada no algoritmo **SM-2** (mesma família usada pelo Anki).

## Objetivo
Permitir que o usuário:
1. Organize questões em uma hierarquia: **Projeto → Caderno → Matéria → Questão**.
2. Importe questões manualmente ou via **PDF** (padrão QConcursos / TecConcursos).
3. Estude no modo flashcard, recebendo cartas **novas** e **para revisar** segundo o SM-2.
4. Tenha tudo isolado por usuário (multi-tenant) com login Email/Senha.

## Stack
| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + Vite + TypeScript |
| UI | Tailwind CSS v3 + shadcn/ui (Radix) |
| Estado de servidor | Firebase Firestore (onSnapshot) |
| Autenticação | Firebase Auth (Email/Password) |
| PDF parsing | pdfjs-dist |
| Roteamento | react-router-dom v6 |
| Notificações | sonner |
| Build/Deploy | Vite build → GitHub Pages (estático) |

## Características-chave
- **Tema dark** obrigatório, mobile-first.
- **Privacidade por usuário**: cada documento traz `userId` e é filtrado por `auth.uid`.
- **Real-time**: listas usam `onSnapshot` — alterações refletem instantaneamente.
- **Cascata de exclusão**: apagar um Projeto remove Cadernos, Matérias e Questões filhas via `writeBatch`.
- **Estudo embaralhado**: a fila de revisão é embaralhada a cada sessão.
- **Importação inteligente**: parser heurístico detecta blocos `Questão N → enunciado → A) … E) → Gabarito: X → Comentário`.
