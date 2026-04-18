# Algoritmo SM-2 (Repetição Espaçada)

Implementação em `src/lib/sm2.ts`.

## Fórmula

```ts
function calcSM2(card, quality) {
  let interval     = card.sm2?.interval     ?? 0;
  let repetitions  = card.sm2?.repetitions  ?? 0;
  let easeFactor   = card.sm2?.easeFactor   ?? 2.5;

  if (quality < 2) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    interval,
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    lastReview: Date.now(),
    nextReview: Date.now() + interval * 86400000,
    lastQuality: quality,
  };
}
```

## Mapeamento de botões → quality

| Botão     | Quality | Efeito                                                |
|-----------|--------:|-------------------------------------------------------|
| 😣 Errei   | 0       | reset: `repetitions=0`, `interval=1`, ease cai forte  |
| 😓 Difícil | 1       | mesmo reset (quality < 2), ease cai pouco             |
| 🙂 Bom     | 3       | progride: 1d → 6d → `interval × easeFactor`           |
| 😄 Fácil   | 5       | progride e ease sobe (+0.1)                           |

## Helpers

```ts
isDue(sm2)  // true se !sm2 || Date.now() >= sm2.nextReview
isNew(sm2)  // true se !sm2 || repetitions === 0
formatNextReview(sm2) // "Nova" | "Para revisar" | "amanhã" | "em 3d" | "em 2m"
shuffle(arr) // Fisher-Yates
```

## Fila de estudo

- **Por matéria**: `questoes` da matéria → filtra `isDue` → `shuffle` → fila.
- **Por projeto**: `questoes` do projeto → filtra `isDue` → `shuffle` → fila.
- **Por questão única**: fila com 1 elemento (clique direto na lista).
- **Cartas novas** entram na fila porque `isDue(null) === true`.

Após cada resposta, `calcSM2` é executado e o estado é persistido com:

```ts
await atualizarQuestao(id, { sm2: novoEstado });
```
