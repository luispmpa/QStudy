# Fluxos de Uso

## 1. Cadastro / Login
1. Usuário acessa `/auth`.
2. Escolhe **Entrar** ou **Cadastrar** (toggle).
3. Submit chama `signInWithEmailAndPassword` ou `createUserWithEmailAndPassword`.
4. Em sucesso: redireciona para `/` (Dashboard). Em erro: toast.

## 2. Criar hierarquia
1. **Projetos** (`/projetos`): botão "Novo projeto" → `NamePromptDialog` → `criarProjeto`.
2. Clicar no card → `/projetos/:projetoId` (Cadernos).
3. "Novo caderno" → `criarCaderno(projetoId, nome)`.
4. Abrir caderno → `/projetos/:projetoId/cadernos/:cadernoId` (Matérias).
5. "Nova matéria" → `criarMateria(projetoId, cadernoId, nome)`.
6. Abrir matéria → `/projetos/.../materias/:materiaId` (Questões).

## 3. Criar uma questão (manual)
1. Em **Questões** ou em **Importar → Manual**: botão "+ Nova Questão".
2. `QuestaoModal` abre com:
   - Enunciado (textarea)
   - Quantidade de alternativas (4 ou 5)
   - Inputs A–D/E
   - Select de Gabarito
   - Banca, Ano, Explicação (opcionais)
3. Submit → `criarQuestao({...})` (com `userId` e `sm2: null`).

## 4. Importar PDF
1. `/importar` → aba **Upload**.
2. Drag & drop do PDF → `extractTextFromPdf` → `parseQuestoes`.
3. Preview renderiza cards. Usuário pode remover individuais.
4. Seleciona Projeto/Caderno/Matéria de destino.
5. "Salvar todas" → `criarQuestoesEmLote(qs)`.

## 5. Estudar
- **Projeto**: Dashboard ou `/projetos/:id` → "Estudar Agora" → `/estudo/projeto/:projetoId`.
- **Matéria**: na lista de questões → "Estudar Matéria" → `/estudo/materia/:materiaId`.
- **Questão única**: clique numa questão da lista → `/estudo/questao/:questaoId`.

### Dentro do estudo (`Estudo.tsx`)
1. Carrega questões do escopo, filtra `isDue`, `shuffle`.
2. Mostra **progresso** (`Questão X de Y`), **banca/ano**, badge **Nova** se aplicável.
3. Exibe **enunciado** e **alternativas**.
4. Ao clicar em uma alternativa:
   - Pinta a **correta de verde**, e a errada (se for o caso) de **vermelho**.
   - Mostra bloco de **gabarito + explicação**.
   - Aparecem 4 botões SM-2.
5. Ao clicar num botão SM-2:
   - `calcSM2(card, quality)` → `atualizarQuestao(id, { sm2 })`.
   - Avança para a próxima questão.
6. Fim da fila → tela de **Conclusão** com resumo e CTA "Voltar".

## 6. Excluir com cascata
- Excluir Projeto → batch apaga `projetos/{id}` + todos `cadernos`, `materias`, `questoes` com `projetoId == id`.
- Excluir Caderno → apaga o caderno + `materias` e `questoes` com `cadernoId == id`.
- Excluir Matéria → apaga a matéria + `questoes` com `materiaId == id`.

## 7. Logout
Sidebar → botão "Sair" → `signOut(auth)` → `Protected` redireciona para `/auth`.
