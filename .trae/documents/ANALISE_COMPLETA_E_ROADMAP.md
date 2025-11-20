# 📊 Análise Completa do Projeto UniVoice

**Autor:** [Sandro Servo](https://cloudservo.com.br)  
**Data:** 20 de Novembro de 2025  
**Versão Atual:** 0.1.0

---

## 🎯 Visão Geral do Projeto

O **UniVoice** é uma plataforma educacional interativa desenvolvida em Next.js que permite aos professores criar apresentações com narração de áudio e transcrição automática em tempo real. Os alunos podem assistir às aulas gravadas com sincronização de slides, áudio e transcrição.

---

## 🏗️ Arquitetura Técnica

### **Stack Tecnológica**
- **Framework:** Next.js 14.2.10 (App Router)
- **Linguagem:** TypeScript 5.6.3
- **UI:** React 18.3.1 + TailwindCSS 3.4.13
- **Banco de Dados:** PostgreSQL 16 (Docker)
- **ORM:** Prisma 5.18.0
- **Autenticação:** JWT customizado com crypto nativo
- **Servidor:** Node.js

### **Estrutura de Pastas**
```
univoice/
├── app/
│   ├── (auth)/
│   │   └── login/          # Página de login
│   ├── aluno/              # Portal do aluno
│   │   ├── [lessonId]/     # Replay da aula
│   │   │   └── summary/    # Resumo da aula
│   │   └── demo/           # Demo do portal
│   ├── apresentacao/       # Área do professor
│   │   ├── nova/           # Criar nova apresentação
│   │   └── [lessonId]/     # Modo apresentação
│   ├── dashboard/          # Painel do professor
│   ├── api/
│   │   ├── auth/           # Login, logout, seed
│   │   ├── lessons/        # CRUD de aulas
│   │   ├── materials/      # Upload de materiais
│   │   └── uploads/        # Servir arquivos estáticos
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Redirect para /login
│   └── globals.css         # Estilos globais
├── components/
│   ├── Presentation.tsx    # Componente de apresentação
│   └── UploadForm.tsx      # Upload de materiais
├── lib/
│   ├── auth.ts             # Funções de autenticação
│   ├── db.ts               # Cliente Prisma
│   └── summarize.ts        # Resumo de transcrições
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── migrations/         # Migrações
├── middleware.ts           # Proteção de rotas
├── uploads/                # Arquivos enviados
└── docker-compose.yml      # Container PostgreSQL
```

---

## 📋 Modelo de Dados (Prisma Schema)

### **Entidades Principais**

#### **User**
- `id`: String (CUID)
- `email`: String (único)
- `name`: String
- `role`: Enum (PROFESSOR | ALUNO)
- `passwordHash`: String
- `passwordSalt`: String
- `createdAt`: DateTime
- **Relacionamentos:** courses[]

#### **Course**
- `id`: String (CUID)
- `name`: String
- `ownerId`: String
- **Relacionamentos:** owner (User), lessons[]

#### **Lesson**
- `id`: String (CUID)
- `title`: String
- `courseId`: String (opcional)
- `createdAt`: DateTime
- `audioPath`: String (opcional)
- **Relacionamentos:** course?, slides[], materials[], segments[]

#### **Slide**
- `id`: String (CUID)
- `lessonId`: String
- `order`: Int
- `filePath`: String

#### **Material**
- `id`: String (CUID)
- `lessonId`: String
- `type`: Enum (PDF | IMAGE | VIDEO)
- `filePath`: String
- `createdAt`: DateTime

#### **TranscriptSegment**
- `id`: String (CUID)
- `lessonId`: String
- `text`: String
- `startTime`: Float
- `endTime`: Float
- `slideIndex`: Int (opcional)

---

## 🔐 Sistema de Autenticação

### **Implementação Atual**
- JWT customizado usando `crypto` nativo do Node.js
- Cookie httpOnly com nome `session`
- Algoritmo: HS256
- Secret: variável de ambiente `AUTH_SECRET` (default: 'dev-secret')

### **Fluxo de Autenticação**
1. Login via `POST /api/auth/login`
2. Validação de email e senha (scrypt + salt)
3. Geração de JWT com payload `{ sub: userId, role: userRole }`
4. Cookie enviado ao cliente
5. Middleware valida rotas protegidas

### **Proteção de Rotas (middleware.ts)**
- **Rotas Protegidas (PROFESSOR apenas):**
  - `/dashboard`
  - `/apresentacao/nova`
  - `/apresentacao/[lessonId]`
- **Rotas Públicas:**
  - `/aluno/*` (Portal do aluno)
  - `/login`
- **Redirect:** Usuário autenticado em `/login` → `/dashboard`

### **Logout**
- Endpoint: `POST /api/auth/logout`
- Remove cookie `session` (maxAge: 0)

---

## 🎓 Funcionalidades Implementadas

### **1. Área do Professor**

#### **Dashboard** (`/dashboard`)
- Botão para criar nova apresentação
- Link para portal do aluno (demo)
- Botão de logout

#### **Criar Apresentação** (`/apresentacao/nova`)
- Criar aula com título
- Upload de materiais (Imagens, PDFs, Vídeos)
- Imagens viram slides automaticamente
- Link para modo apresentação

#### **Modo Apresentação** (`/apresentacao/[lessonId]`)
- **Recursos em Tempo Real:**
  - Captura de áudio (MediaRecorder API)
  - Reconhecimento de fala (Web Speech API - pt-BR)
  - Transcrição em tempo real
  - Navegação de slides
  - Sincronização de timestamp com slideIndex
- **Controles:**
  - Iniciar/Parar gravação
  - Anterior/Próximo slide
  - Visualização de transcrição (final + interim)

### **2. Área do Aluno**

#### **Portal Demo** (`/aluno/demo`)
- Página informativa
- Link para criar nova aula

#### **Replay da Aula** (`/aluno/[lessonId]`)
- Player de áudio HTML5
- Sincronização automática de slides com áudio
- Visualização de transcrição completa
- Timeline baseada em timestamps

#### **Resumo da Aula** (`/aluno/[lessonId]/summary`)
- (Pendente de verificação/implementação)

---

## 🔄 APIs Disponíveis

### **Autenticação**
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/seed` - Criar usuário demo (dev)

### **Lições**
- `POST /api/lessons/create` - Criar nova lição
- `GET /api/lessons/[lessonId]` - Obter dados da lição
- `POST /api/lessons/[lessonId]/audio` - Upload de áudio
- `POST /api/lessons/[lessonId]/transcript` - Adicionar segmento de transcrição
- `GET /api/lessons/[lessonId]/transcript` - Obter transcrição completa
- `GET /api/lessons/[lessonId]/summary` - Obter resumo (pendente)

### **Materiais**
- `POST /api/materials/upload` - Upload de material (cria slide se for IMAGE)

### **Uploads**
- `/api/uploads/materials/[lessonId]/[filename]` - Servir materiais
- `/api/uploads/audio/[lessonId]/[filename]` - Servir áudio

---

## ✅ Status Atual do Projeto

### **✓ Implementado**
- [x] Estrutura básica do projeto
- [x] Schema do banco de dados
- [x] Autenticação JWT customizada
- [x] Middleware de proteção de rotas
- [x] Login e logout
- [x] Dashboard do professor
- [x] Criação de apresentações
- [x] Upload de materiais
- [x] Modo apresentação com gravação
- [x] Reconhecimento de fala em tempo real
- [x] Transcrição automática
- [x] Sincronização de slides
- [x] Portal do aluno com replay
- [x] Player de áudio sincronizado
- [x] Visualização de transcrição

### **⚠️ Tarefas Documentadas (Concluídas)**
- [x] Corrigir 404 inicial (`app/page.tsx` criado)
- [x] Proteger rotas (middleware implementado)
- [x] Adicionar logout (implementado)

---

## 🚀 Roadmap de Desenvolvimento

### **Fase 1: Melhorias de Segurança e Autenticação** 🔒
**Prioridade:** Alta

1. **Implementar Variável de Ambiente AUTH_SECRET**
   - Adicionar `AUTH_SECRET` no `.env` e `.env.example`
   - Validar que não está usando 'dev-secret' em produção
   - Adicionar documentação

2. **Adicionar Expiração aos Tokens JWT**
   - Implementar campo `exp` no payload
   - Adicionar refresh token (opcional)
   - Validar expiração no middleware

3. **Melhorar Validação de Inputs**
   - Adicionar validação de email
   - Validação de senha forte
   - Sanitização de inputs

4. **Implementar Rate Limiting**
   - Limitar tentativas de login
   - Proteção contra brute force
   - Cache de IPs bloqueados

---

### **Fase 2: Funcionalidades do Professor** 👨‍🏫
**Prioridade:** Alta

5. **Dashboard com Lista de Aulas**
   - Listar todas as aulas do professor
   - Botões de editar/excluir
   - Filtros e busca
   - Estatísticas básicas

6. **Gerenciamento de Cursos**
   - CRUD completo de cursos
   - Associar aulas a cursos
   - Organização hierárquica

7. **Edição de Apresentações**
   - Editar título da aula
   - Reordenar slides manualmente
   - Excluir slides
   - Substituir áudio

8. **Upload de Áudio Pré-gravado**
   - Upload de arquivo de áudio
   - Sincronização manual de slides
   - Preview antes de salvar

9. **Biblioteca de Materiais**
   - Visualizar todos os materiais
   - Reutilizar materiais entre aulas
   - Tags e categorização

---

### **Fase 3: Funcionalidades do Aluno** 👨‍🎓
**Prioridade:** Média

10. **Sistema de Resumos com IA**
    - Implementar `/aluno/[lessonId]/summary`
    - Integrar API de IA (OpenAI/Anthropic)
    - Gerar resumos estruturados
    - Destacar pontos principais

11. **Busca na Transcrição**
    - Campo de busca por palavra-chave
    - Navegação por resultados
    - Highlight na transcrição
    - Saltar para momento específico

12. **Download de Materiais**
    - Botão de download para PDFs
    - Download de transcrição (TXT/PDF)
    - Download de slides (ZIP)

13. **Notas Pessoais do Aluno**
    - Adicionar notas em timestamps
    - Bookmarks de momentos importantes
    - Exportar notas

14. **Velocidade de Reprodução**
    - Controle de velocidade (0.5x, 1x, 1.5x, 2x)
    - Memória de preferência do usuário

---

### **Fase 4: UX e Responsividade** 📱
**Prioridade:** Alta

15. **Design Responsivo Completo**
    - Mobile-first design
    - Tablets e desktops
    - Touch gestures para slides
    - PWA (Progressive Web App)

16. **Melhorias de UI/UX**
    - Feedback visual de ações
    - Loading states
    - Error boundaries
    - Toast notifications
    - Modais de confirmação

17. **Acessibilidade (A11y)**
    - ARIA labels
    - Navegação por teclado
    - Contraste de cores (WCAG)
    - Screen reader support
    - Closed captions

18. **Tema Escuro**
    - Toggle dark/light mode
    - Preferência do sistema
    - Persistência de escolha

---

### **Fase 5: Performance e Otimização** ⚡
**Prioridade:** Média

19. **Otimização de Imagens**
    - Next.js Image component
    - Lazy loading
    - WebP/AVIF format
    - Thumbnail generation

20. **Otimização de Áudio**
    - Compressão de áudio
    - Conversão para formato otimizado (MP3/AAC)
    - Streaming adaptativo

21. **Caching e CDN**
    - Cache de materiais estáticos
    - Redis para sessões
    - CDN para uploads
    - Service Worker

22. **Code Splitting**
    - Dynamic imports
    - Route-based splitting
    - Component lazy loading

---

### **Fase 6: SEO e Marketing** 🔍
**Prioridade:** Baixa

23. **SEO Básico**
    - Meta tags dinâmicas
    - Open Graph tags
    - Sitemap.xml
    - Robots.txt
    - Schema.org markup

24. **Landing Page**
    - Página inicial institucional
    - Seção de recursos
    - Depoimentos
    - Pricing/Planos
    - FAQ

25. **Blog/Documentação**
    - Guia de uso
    - Tutoriais em vídeo
    - Casos de uso
    - Changelog

---

### **Fase 7: Administração e Analytics** 📊
**Prioridade:** Média

26. **Painel Administrativo**
    - Gestão de usuários
    - Moderação de conteúdo
    - Logs de sistema
    - Métricas de uso

27. **Analytics e Métricas**
    - Tempo de visualização
    - Taxa de conclusão
    - Engajamento por slide
    - Heatmaps de interesse

28. **Relatórios para Professores**
    - Quem assistiu suas aulas
    - Tempo médio de visualização
    - Perguntas frequentes
    - Feedback dos alunos

---

### **Fase 8: Colaboração e Social** 👥
**Prioridade:** Baixa

29. **Sistema de Comentários**
    - Comentários em timestamps
    - Discussões por aula
    - Moderação

30. **Compartilhamento Social**
    - Compartilhar aulas
    - Links públicos/privados
    - Embedar em sites externos

31. **Gamificação**
    - Badges de conclusão
    - Streak de estudos
    - Leaderboards (opcional)

---

### **Fase 9: Infraestrutura e DevOps** 🛠️
**Prioridade:** Alta (antes do deploy)

32. **Configurar CI/CD**
    - GitHub Actions
    - Testes automatizados
    - Deploy automático
    - Preview deployments

33. **Testes**
    - Unit tests (Jest)
    - Integration tests
    - E2E tests (Playwright)
    - Coverage reports

34. **Logging e Monitoramento**
    - Sentry para errors
    - Analytics de performance
    - Uptime monitoring
    - Alerts automatizados

35. **Backup e Recovery**
    - Backup automático do DB
    - Backup de uploads
    - Disaster recovery plan

36. **Documentação Técnica**
    - README completo
    - API documentation (Swagger)
    - Guia de contribuição
    - Arquitetura diagrams

---

### **Fase 10: Escala e Avançado** 🚀
**Prioridade:** Baixa (futuro)

37. **Multitenancy**
    - Suporte a múltiplas instituições
    - Isolamento de dados
    - Custom domains

38. **Integração com LMS**
    - SCORM compliance
    - Moodle integration
    - Canvas integration

39. **IA Avançada**
    - Legendas automáticas multilíngue
    - Tradução em tempo real
    - Geração de quizzes automáticos
    - Recomendações personalizadas

40. **WebRTC para Live Classes**
    - Aulas ao vivo
    - Interação em tempo real
    - Q&A ao vivo
    - Polls e quizzes durante aula

---

## 🐛 Bugs Conhecidos e Pendências Técnicas

### **Bugs a Corrigir**

1. **Logout via Server Action**
   - O logout no dashboard usa `fetch` em uma Server Action
   - Deve usar `redirect` após limpar o cookie
   - Atualmente não redireciona automaticamente

2. **Path de Imagem no Player do Aluno**
   - `slides[currentSlide].filePath.replace(process.cwd(), '')`
   - Replace de `process.cwd()` não funciona corretamente
   - Paths devem ser relativos desde o upload

3. **Falta Tratamento de Erros**
   - APIs sem tratamento adequado de erros
   - Falta validação de permissões (user pode acessar qualquer lessonId)
   - Sem feedback de erro para o usuário

4. **Segurança de Uploads**
   - Sem validação de tipo de arquivo
   - Sem limite de tamanho
   - Nomes de arquivo previsíveis
   - Possível path traversal

5. **Browser Compatibility**
   - Web Speech API não funciona em todos os browsers
   - MediaRecorder suporte limitado
   - Falta fallback ou aviso

### **Melhorias Técnicas**

6. **Validação de Dados**
   - Adicionar Zod ou Yup para validação
   - Type-safe em todas as APIs
   - Validação client-side e server-side

7. **Tratamento de Arquivos**
   - Usar Object Storage (S3, R2, etc.)
   - Gerar thumbnails para imagens
   - Processar vídeos (conversão de formato)

8. **Otimização de Queries**
   - Adicionar índices no banco
   - Paginação de resultados
   - Select específico de campos

9. **TypeScript Strict Mode**
   - Habilitar strict: true no tsconfig
   - Corrigir todos os tipos any
   - Adicionar tipos para APIs

10. **Environment Variables**
    - Criar `.env.example`
    - Documentar todas as variáveis
    - Validar variáveis obrigatórias

---

## 📝 Próximos Passos Recomendados

### **Imediato (Esta Sprint)**

1. ✅ **Inicializar Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: UniVoice v0.1.0"
   ```

2. ✅ **Criar .env.example**
   - Documentar todas as variáveis de ambiente

3. ✅ **Adicionar .gitignore completo**
   - node_modules, uploads, .env, etc.

4. ✅ **Criar README.md**
   - Instruções de instalação
   - Como executar
   - Credenciais de teste

5. ✅ **Corrigir Bug do Logout**
   - Implementar redirect correto

6. ✅ **Adicionar Validação Básica**
   - Validar inputs do usuário
   - Tratar erros nas APIs

### **Curto Prazo (1-2 semanas)**

7. **Dashboard com Lista de Aulas**
   - Implementar GET de todas as aulas do professor
   - UI para listar, editar e excluir

8. **Implementar Resumos com IA**
   - Integrar OpenAI ou alternativa
   - Criar página de resumo funcional

9. **Melhorar Responsividade**
   - Testar em mobile
   - Ajustar layouts

10. **Adicionar Testes Básicos**
    - Configurar Jest
    - Testes de autenticação
    - Testes de APIs críticas

### **Médio Prazo (1-2 meses)**

11. **Sistema Completo de Cursos**
12. **Analytics Básico**
13. **SEO e Landing Page**
14. **Deploy em Produção**
    - Vercel para Next.js
    - Supabase ou Railway para PostgreSQL
    - S3 para uploads

---

## 🔧 Comandos Úteis

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start

# Gerar cliente Prisma
npx prisma generate

# Criar migração
npx prisma migrate dev --name nome_da_migracao

# Abrir Prisma Studio
npx prisma studio

# Semear banco (criar usuário demo)
# Acessar: http://localhost:3000/api/auth/seed
```

### **Docker**
```bash
# Subir banco de dados
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f

# Resetar dados
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy
```

---

## 📚 Recursos e Dependências

### **Dependências de Produção**
- `@prisma/client@5.18.0` - ORM
- `next@14.2.10` - Framework
- `react@18.3.1` - UI Library
- `react-dom@18.3.1` - React DOM

### **Dependências de Desenvolvimento**
- `@types/node@24.10.1`
- `@types/react@19.2.4`
- `autoprefixer@10.4.20`
- `postcss@8.4.49`
- `prisma@5.18.0`
- `tailwindcss@3.4.13`
- `typescript@5.6.3`

### **APIs e Serviços Externos (Recomendados)**
- **OpenAI API** - Resumos e IA
- **AWS S3 / Cloudflare R2** - Storage de arquivos
- **SendGrid / Resend** - Emails transacionais
- **Sentry** - Error tracking
- **Vercel Analytics** - Web analytics

---

## 📄 Licença e Créditos

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Versão:** 0.1.0  
**Status:** Em Desenvolvimento

---

## 📞 Suporte e Contato

Para dúvidas ou suporte técnico:
- **Website:** [cloudservo.com.br](https://cloudservo.com.br)
- **Email:** contato@cloudservo.com.br

---

**Última atualização:** 20 de Novembro de 2025
