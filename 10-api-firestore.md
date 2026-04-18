# API interna — `src/lib/firestore.ts`

Todas as funções exigem usuário autenticado (lançam `Error("Não autenticado")`).

## Projetos

```ts
listenProjetos(cb: (data: Projeto[]) => void): Unsubscribe
criarProjeto(nome: string): Promise<void>
renomearProjeto(id: string, nome: string): Promise<void>
excluirProjeto(id: string): Promise<void>   // cascade
```

## Cadernos

```ts
listenCadernos(projetoId: string, cb: (data: Caderno[]) => void): Unsubscribe
criarCaderno(projetoId: string, nome: string): Promise<void>
renomearCaderno(id: string, nome: string): Promise<void>
excluirCaderno(id: string): Promise<void>   // cascade
```

## Matérias

```ts
listenMaterias(cadernoId: string, cb: (data: Materia[]) => void): Unsubscribe
criarMateria(projetoId: string, cadernoId: string, nome: string): Promise<void>
renomearMateria(id: string, nome: string): Promise<void>
excluirMateria(id: string): Promise<void>   // cascade
```

## Questões

```ts
listenQuestoesPorMateria(materiaId: string, cb): Unsubscribe
listenQuestoesPorProjeto(projetoId: string, cb): Unsubscribe

type NovaQuestao = Omit<Questao, "id" | "userId" | "criadoEm" | "sm2">;

criarQuestao(q: NovaQuestao): Promise<void>
criarQuestoesEmLote(qs: NovaQuestao[]): Promise<void>     // writeBatch
atualizarQuestao(id: string, data: Partial<Questao>): Promise<void>
excluirQuestao(id: string): Promise<void>
```

## Padrões aplicados

- **Listeners** retornam a função `Unsubscribe` do Firestore — usar `return listenX(...)` direto no `useEffect`.
- **Cascade delete** com `writeBatch`: 1 commit atômico apaga pai + filhos.
- **userId injetado** automaticamente em `create`/`createMany`.
- **Ordenação**: queries de Projetos/Cadernos/Matérias usam `orderBy("criadoEm","desc")`. Questões ordenam client-side para evitar índice extra.
