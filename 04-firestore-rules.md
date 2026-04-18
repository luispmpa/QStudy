# Regras de Segurança do Firestore

Cole no Console Firebase → Firestore Database → **Rules**.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: dono autenticado
    function isOwner() {
      return request.auth != null
          && request.auth.uid == resource.data.userId;
    }
    function isCreatingAsSelf() {
      return request.auth != null
          && request.auth.uid == request.resource.data.userId;
    }

    match /projetos/{id} {
      allow read, update, delete: if isOwner();
      allow create: if isCreatingAsSelf();
    }

    match /cadernos/{id} {
      allow read, update, delete: if isOwner();
      allow create: if isCreatingAsSelf();
    }

    match /materias/{id} {
      allow read, update, delete: if isOwner();
      allow create: if isCreatingAsSelf();
    }

    match /questoes/{id} {
      allow read, update, delete: if isOwner();
      allow create: if isCreatingAsSelf();
    }
  }
}
```

## Por que separadas?
Para clareza e auditoria. Caso prefira, pode usar a versão genérica (mesma semântica):

```js
match /{coll}/{docId} {
  allow read, update, delete: if request.auth != null
      && request.auth.uid == resource.data.userId;
  allow create: if request.auth != null
      && request.auth.uid == request.resource.data.userId;
}
```

## Garantias
- Usuário **A** nunca lê, edita ou apaga documentos do usuário **B**.
- O campo `userId` no `create` deve obrigatoriamente ser igual ao `auth.uid` (impede falsificação).
- Não há acesso anônimo: `request.auth` precisa existir.

## Observação sobre `list`/`query`
As regras `read` cobrem `get` e `list`. As queries do app **sempre** incluem `where('userId','==',auth.uid)`, então a engine de regras valida corretamente.
