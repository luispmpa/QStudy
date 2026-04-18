# Troubleshooting

## "The query requires an index"
Esperado na primeira execução. Clique no link do erro (no console do navegador) e o Firebase cria o índice automaticamente. Aguarde alguns minutos até ficar **Enabled**.

## "Missing or insufficient permissions"
- Conferir se as regras de `04-firestore-rules.md` foram **publicadas**.
- Conferir se o documento tem `userId === auth.uid`.
- Se você criou docs antes do multi-user, eles podem estar **órfãos** (sem `userId`) — apague-os no console.

## Login falha com `auth/operation-not-allowed`
Habilite **Email/Password** no Firebase Console → Authentication → Sign-in method.

## Login no GitHub Pages dá `auth/unauthorized-domain`
Adicione `SEU-USUARIO.github.io` em Firebase → Authentication → Settings → **Authorized domains**.

## Refresh em rota interna do Pages dá 404
Adicione `public/404.html` como cópia do `index.html` (fallback SPA).

## PDF não é parseado
- O PDF pode ser **escaneado** (imagem). Sem OCR não há texto extraível.
- Layout de duas colunas pode misturar texto — tente um PDF de coluna única.
- Verifique se o padrão `Questão N` aparece no texto extraído (use a aba de preview).

## Questões "novas" não aparecem no estudo
Verifique se `sm2` está como `null` (não `undefined`). O helper `isDue` trata `null/undefined` como devida.

## Build do Vite falha por base path
Garanta `base: '/NOME-DO-REPO/'` em `vite.config.ts` e que o `BrowserRouter` recebe `basename` se necessário (em Pages com subpath, prefira `HashRouter` se tiver muitos problemas com refresh).

## "FirebaseError: quota exceeded"
O plano Spark tem cota generosa para uso pessoal. Para múltiplos usuários intensivos, faça upgrade para Blaze.
