# Modelo de Dados (Firestore)

Todas as coleções são **flat** (no nível raiz) e relacionadas por IDs. Todos os documentos carregam `userId` para isolamento.

## Coleções

### `projetos`
```ts
{
  id: string;          // doc id
  nome: string;
  userId: string;      // auth.uid do dono
  criadoEm: number;    // Date.now()
}
```

### `cadernos`
```ts
{
  id: string;
  projetoId: string;
  nome: string;
  userId: string;
  criadoEm: number;
}
```

### `materias`
```ts
{
  id: string;
  cadernoId: string;
  projetoId: string;   // denormalizado (acelera consultas por projeto)
  nome: string;
  userId: string;
  criadoEm: number;
}
```

### `questoes`
```ts
{
  id: string;
  materiaId: string;
  cadernoId: string;
  projetoId: string;   // denormalizado
  userId: string;
  enunciado: string;
  alternativas: { A?: string; B?: string; C?: string; D?: string; E?: string };
  gabarito: "A" | "B" | "C" | "D" | "E";
  explicacao?: string;
  banca?: string;
  ano?: string;
  sm2: SM2State | null; // null = nunca estudada (carta nova)
  criadoEm: number;
}
```

### Estado SM-2
```ts
interface SM2State {
  interval: number;       // dias até a próxima revisão
  repetitions: number;    // sequência de acertos consecutivos
  easeFactor: number;     // ≥ 1.3 (default 2.5)
  lastReview: number;     // Date.now()
  nextReview: number;     // Date.now() + interval * 86400000
  lastQuality: number;    // 0,1,3,5
}
```

## Decisões de modelagem

- **Denormalização de `projetoId` em matérias e questões**: permite "Estudar Projeto" com **1 query** (`where('projetoId','==',id)`) em vez de joins manuais.
- **Coleções flat**: simplifica regras de segurança e cascade. O batch de delete varre cada coleção filha por `where('projetoId','==',id)` e remove tudo.
- **`sm2: null`** representa carta nova; helpers `isNew()` e `isDue()` em `lib/sm2.ts` tratam esse caso.
- **Ordenação**: lista de questões por matéria é ordenada **client-side** por `criadoEm desc` para evitar exigência de índice composto. Projetos/cadernos/matérias usam `orderBy('criadoEm','desc')` no servidor.

## Índices necessários

O Firestore pedirá índices compostos na primeira execução de algumas queries. Clique no link de erro do console para criar automaticamente. Tipicamente:

| Coleção | Campos |
|---------|--------|
| `cadernos`  | `userId ASC`, `projetoId ASC`, `criadoEm DESC` |
| `materias`  | `userId ASC`, `cadernoId ASC`, `criadoEm DESC` |
| `questoes`  | `userId ASC`, `materiaId ASC` |
| `questoes`  | `userId ASC`, `projetoId ASC` |
