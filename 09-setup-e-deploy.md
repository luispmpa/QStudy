# Setup e Deploy

## Pré-requisitos
- Node.js 18+ (ou Bun)
- Conta Firebase (projeto já configurado em `src/lib/firebase.ts`)

## Rodar local

```bash
# instalar dependências
npm install      # ou: bun install

# subir dev server (Vite na porta 8080)
npm run dev      # ou: bun run dev
```

Acesse `http://localhost:8080`.

## Configuração Firebase (uma vez)

### 1. Habilitar Authentication
Console Firebase → **Authentication** → **Sign-in method** → habilite **Email/Password**.

### 2. Criar Firestore Database
Console Firebase → **Firestore Database** → Criar (modo produção) → escolha região (ex: `southamerica-east1`).

### 3. Aplicar regras
Cole o conteúdo de `04-firestore-rules.md` em **Firestore → Rules → Publish**.

### 4. Criar índices compostos
Na primeira vez que cada listagem rodar, o console do navegador mostrará um link tipo:
```
https://console.firebase.google.com/.../indexes?create_composite=...
```
Clique e confirme. Repita até não aparecerem mais erros. Veja `03-modelo-de-dados.md` para a lista esperada.

## Build de produção

```bash
npm run build
# saída em dist/
```

## Deploy no GitHub Pages

1. **Configurar base no Vite** (necessário para Pages em subpasta):
   Em `vite.config.ts`, adicione:
   ```ts
   base: '/NOME-DO-REPO/',
   ```

2. **Roteamento**: Pages serve estático, então a SPA precisa de fallback. Crie `public/404.html` idêntico ao `index.html` (cópia simples) — assim qualquer rota recarregada cai no app.

3. **Build & publish**:
   ```bash
   npm run build
   # opção A: branch gh-pages
   npx gh-pages -d dist
   # opção B: GitHub Actions (workflow oficial pages-deploy)
   ```

4. **Settings do repo** → Pages → Source: `gh-pages` (ou Actions).

5. **Authorized domains no Firebase Auth**:
   Console Firebase → Authentication → Settings → **Authorized domains** → adicione `SEU-USUARIO.github.io`.

## Variáveis sensíveis
A config do Firebase é **publicável** (apiKey é client-side). A segurança real vem das **Firestore Rules**. Não há segredos privados neste projeto.

## Scripts disponíveis (`package.json`)
| Script | Função |
|--------|--------|
| `dev` | Vite dev server |
| `build` | Build de produção |
| `preview` | Servir o `dist/` localmente |
| `lint` | ESLint |
| `test` | Vitest |
