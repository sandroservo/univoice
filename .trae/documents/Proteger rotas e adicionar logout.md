## Objetivo
Garantir que apenas Professores autenticados acessem o painel e o modo apresentação, e oferecer saída segura da sessão.

## Implementação
1. Criar `middleware.ts` para proteger rotas:
   - Verificar cookie `session` e validar com `verifySession`.
   - Restringir `/dashboard`, `/apresentacao/nova` e `/apresentacao/:lessonId` a `role=PROFESSOR`.
   - Se já autenticado, acessar `/login` redireciona para `/dashboard`.
   - Deixar `/aluno/*` público.
2. Adicionar `POST /api/auth/logout` que apaga o cookie `session`.
3. Ajustar navegação mínima:
   - No login, após sucesso, já redireciona para `/dashboard` (já implementado).
   - Opcional: inserir link “Sair” em páginas do Professor que chama o logout.

## Verificação
- Em modo dev, acessar `/dashboard` sem login → redireciona para `/login`.
- Fazer login como Professor demo → acessar `/apresentacao/nova` e `/apresentacao/<lessonId>` normalmente.
- Chamar logout → volta a exigir login nas rotas protegidas.

## Observações
- Não há mudança de schema.
- Portal do Aluno permanece acessível sem login de teste, conforme requisito.