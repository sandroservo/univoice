## Diagnóstico
- O 404 aparece ao acessar `/` porque não existe `app/page.tsx`; Next.js exibe “This page could not be found” quando a rota raiz não tem página.
- As rotas já existentes:
  - `/.` (inexistente)
  - `/login` (por `app/(auth)/login/page.tsx` — o grupo `(auth)` não aparece no caminho)
  - `/dashboard`, `/apresentacao/nova`, `/apresentacao/[lessonId]`
  - `/aluno/[lessonId]`, `/aluno/[lessonId]/summary`
  - API: `/api/lessons/[lessonId]`, `/api/materials/upload`, `/api/auth/seed`, etc.

## Implementação
1. Criar `app/page.tsx` e redirecionar para `/login` usando `redirect` de `next/navigation` (solução mais simples e direta).
2. Alternativa: criar uma landing simples com links para `/login`, `/dashboard` e `/apresentacao/nova`.
3. Remover `experimental.serverActions` do `next.config.js` para eliminar o aviso (Server Actions já são padrão).
4. Pequena melhoria opcional: adicionar links básicos no layout (`app/layout.tsx`) para facilitar navegação.

## Verificação
- Rodar `npm run dev` e abrir `http://localhost:3000/`.
- Confirmar que `/` redireciona para `/login` e que o login funciona com o usuário demo (semeado por `/api/auth/seed`).
- Criar uma aula em `/apresentacao/nova`, verificar upload de imagens criando slides, e abrir `/apresentacao/<lessonId>` sem 404.
- Acessar `/aluno/<lessonId>` e `/aluno/<lessonId>/summary` para conferir replay e resumo sem 404.

## Observações
- O erro 404 não está relacionado ao arquivo aberto `app/api/lessons/[lessonId]/route.ts`; a API existe, e o 404 é da rota de página raiz.
- Após estes ajustes, a navegação padrão fica estável e elimina o 404 inicial.