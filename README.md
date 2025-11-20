# 🎓 UniVoice - Plataforma Educacional com Transcrição em Tempo Real

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Versão:** 0.1.0

---

## 📖 Sobre o Projeto

UniVoice é uma plataforma educacional inovadora que permite aos professores criar apresentações com narração de áudio e transcrição automática em tempo real. Os alunos podem assistir às aulas gravadas com sincronização perfeita entre slides, áudio e transcrição.

### ✨ Principais Recursos

- 🎤 **Gravação de Áudio em Tempo Real** - Captura de áudio durante a apresentação
- 🗣️ **Transcrição Automática** - Reconhecimento de fala em português (pt-BR)
- 📊 **Sincronização de Slides** - Slides sincronizados automaticamente com a narração
- 🎬 **Replay Inteligente** - Alunos assistem com sincronização perfeita
- 📝 **Transcrição Completa** - Texto completo da aula disponível
- 🔐 **Autenticação Segura** - Sistema JWT para professores
- 📱 **Interface Responsiva** - Design adaptável (em desenvolvimento)

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 14.2.10 (App Router)
- **Linguagem:** TypeScript 5.6.3
- **UI:** React 18.3.1 + TailwindCSS 3.4.13
- **Banco de Dados:** PostgreSQL 16
- **ORM:** Prisma 5.18.0
- **Autenticação:** JWT customizado
- **APIs do Browser:**
  - Web Speech API (reconhecimento de fala)
  - MediaRecorder API (gravação de áudio)

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+ e npm
- Docker e Docker Compose
- Navegador com suporte a Web Speech API (Chrome recomendado)

### Passo a Passo

1. **Clone o repositório** (ou extraia o projeto)
```bash
cd univoice
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:
```env
# Banco de Dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=univoice
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/univoice?schema=public

# Autenticação (use uma chave forte em produção!)
AUTH_SECRET=dev-secret-change-in-production
```

4. **Inicie o banco de dados (Docker)**
```bash
docker-compose up -d
```

5. **Execute as migrações do Prisma**
```bash
npx prisma migrate deploy
npx prisma generate
```

6. **Crie um usuário de demonstração**
```bash
# Acesse no navegador:
http://localhost:3000/api/auth/seed
```

Isso criará um professor demo com as credenciais:
- **Email:** `prof@demo.com`
- **Senha:** `senha123`

7. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

8. **Acesse a aplicação**
```
http://localhost:3000
```

---

## 📚 Como Usar

### Para Professores

1. **Login**
   - Acesse `/login`
   - Use as credenciais: `prof@demo.com` / `senha123`

2. **Criar Nova Apresentação**
   - No dashboard, clique em "Nova Apresentação"
   - Digite o título da aula
   - Faça upload de imagens (slides)
   - Acesse o modo apresentação

3. **Gravar Aula**
   - Clique em "Iniciar" para começar a gravação
   - Navegue pelos slides enquanto narra
   - A transcrição aparece em tempo real
   - Clique em "Parar" ao finalizar

4. **Compartilhar com Alunos**
   - Copie o link: `/aluno/[lessonId]`
   - Compartilhe com seus alunos

### Para Alunos

1. **Acessar Aula**
   - Abra o link compartilhado pelo professor
   - `/aluno/[lessonId]`

2. **Assistir Replay**
   - Pressione play no player de áudio
   - Slides mudam automaticamente
   - Visualize a transcrição completa abaixo

---

## 📁 Estrutura do Projeto

```
univoice/
├── app/                    # Next.js App Router
│   ├── (auth)/login/      # Página de login
│   ├── aluno/             # Portal do aluno
│   ├── apresentacao/      # Área de apresentação
│   ├── dashboard/         # Dashboard do professor
│   └── api/               # API Routes
├── components/            # Componentes React
├── lib/                   # Utilitários e helpers
├── prisma/                # Schema e migrações
├── uploads/               # Arquivos enviados (local)
└── middleware.ts          # Proteção de rotas
```

---

## 🗄️ Modelo de Dados

### Principais Entidades

- **User** - Usuários (professores e alunos)
- **Course** - Cursos
- **Lesson** - Aulas/Apresentações
- **Slide** - Slides da apresentação
- **Material** - Materiais de apoio (PDF, imagens, vídeos)
- **TranscriptSegment** - Segmentos de transcrição com timestamps

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Modo desenvolvimento
npm run build        # Build para produção
npm start            # Servidor produção
```

### Prisma
```bash
npx prisma studio              # Interface visual do banco
npx prisma generate            # Gerar cliente Prisma
npx prisma migrate dev         # Criar nova migração
npx prisma migrate deploy      # Aplicar migrações
```

### Docker
```bash
docker-compose up -d           # Iniciar PostgreSQL
docker-compose down            # Parar containers
docker-compose logs -f         # Ver logs
```

---

## 🐛 Problemas Conhecidos

### Compatibilidade do Navegador

A Web Speech API tem suporte limitado:
- ✅ Chrome/Edge (recomendado)
- ⚠️ Firefox (suporte parcial)
- ❌ Safari (não suportado)

### Resolução de Problemas Comuns

**Erro: "Prisma Client não encontrado"**
```bash
npx prisma generate
```

**Erro: "Porta 5433 já em uso"**
```bash
# Altere a porta no docker-compose.yml e .env
```

**Erro: "Cookie não está sendo salvo"**
```bash
# Verifique se está usando http://localhost (não 127.0.0.1)
```

---

## 🚀 Roadmap

### Em Desenvolvimento
- [ ] Dashboard com lista de aulas
- [ ] Sistema de resumos com IA
- [ ] Design responsivo completo
- [ ] Busca na transcrição
- [ ] Download de materiais

### Futuro
- [ ] Aulas ao vivo (WebRTC)
- [ ] Legendas multilíngue
- [ ] Integração com LMS
- [ ] Analytics avançado
- [ ] Sistema de comentários

Veja o roadmap completo em: `.trae/documents/ANALISE_COMPLETA_E_ROADMAP.md`

---

## 🔐 Segurança

### ⚠️ Importante para Produção

1. **Altere o AUTH_SECRET** no `.env`
2. **Use HTTPS** em produção
3. **Configure rate limiting**
4. **Valide todos os inputs**
5. **Use Object Storage** (S3, R2) para uploads
6. **Adicione expiração aos tokens JWT**

---

## 📄 Licença

Este projeto é proprietário.

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)

---

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Leia o `ANALISE_COMPLETA_E_ROADMAP.md`
2. Crie uma branch para sua feature
3. Siga as boas práticas de código
4. Adicione testes quando possível
5. Submeta um Pull Request

---

## 📞 Suporte

- **Website:** [cloudservo.com.br](https://cloudservo.com.br)
- **Email:** contato@cloudservo.com.br

---

## 🙏 Agradecimentos

Obrigado por usar o UniVoice! 🎓

---

**Última atualização:** Novembro de 2025
