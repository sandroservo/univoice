# ✅ Checklist de Deploy - UniVoice na Vercel

## 📋 Antes do Deploy

### 1. Código no GitHub
- [x] Código commitado
- [x] Push para GitHub realizado
- [x] Repositório: https://github.com/sandroservo/univoice

### 2. Arquivos de Configuração
- [x] `next.config.js` otimizado
- [x] `vercel.json` configurado
- [x] `.vercelignore` criado
- [x] `package.json` com `postinstall` do Prisma
- [x] `.env.example` documentado

---

## 🚀 Durante o Deploy na Vercel

### 1. Criar Projeto na Vercel
- [ ] Acessar https://vercel.com
- [ ] Login com GitHub
- [ ] New Project
- [ ] Import `sandroservo/univoice`

### 2. Configurar Projeto
- [ ] Framework: Next.js (auto-detectado)
- [ ] Build Command: `npm run build` (padrão)
- [ ] Output Directory: `.next` (padrão)
- [ ] Install Command: `npm install` (padrão)

### 3. Configurar Banco de Dados

**Escolher UMA opção:**

#### Opção A: Vercel Postgres (Recomendado)
- [ ] Storage → Create Database → Postgres
- [ ] Connect to Project
- [ ] DATABASE_URL adicionado automaticamente ✅

#### Opção B: Supabase (Grátis)
- [ ] Criar projeto em https://supabase.com
- [ ] Copiar Connection String (Pooling)
- [ ] Adicionar `?sslmode=require` no final
- [ ] Adicionar na Vercel como DATABASE_URL

#### Opção C: Neon (Grátis)
- [ ] Criar projeto em https://neon.tech
- [ ] Copiar Connection String
- [ ] Adicionar na Vercel como DATABASE_URL

### 4. Adicionar Variáveis de Ambiente

**Na Vercel → Settings → Environment Variables:**

- [ ] **DATABASE_URL**
  ```
  Valor: postgresql://...?sslmode=require
  Environment: Production, Preview, Development
  ```

- [ ] **AUTH_SECRET**
  ```
  Gerar com: openssl rand -base64 32
  Environment: Production, Preview, Development
  ```

### 5. Deploy Inicial
- [ ] Clicar em "Deploy"
- [ ] Aguardar build (~2-3 minutos)
- [ ] Verificar logs de build
- [ ] ✅ Deploy bem-sucedido

---

## 🗄️ Após Deploy - Configurar Database

### 1. Executar Migrations

**Localmente (recomendado):**
```bash
# Usar DATABASE_URL de produção
DATABASE_URL="sua_url_producao" npx prisma db push
```

**Ou via Vercel CLI:**
```bash
# Instalar CLI
npm i -g vercel

# Pull env vars
vercel env pull .env.production.local

# Executar migrations
npx prisma db push
```

### 2. Verificar Database
- [ ] Migrations executadas sem erros
- [ ] Tabelas criadas no banco
- [ ] Schema sincronizado

---

## ✅ Testes Pós-Deploy

### 1. Acessar Site
- [ ] URL: `https://univoice.vercel.app` (ou sua URL)
- [ ] Site carrega sem erros
- [ ] Página de login aparece

### 2. Testar Funcionalidades Básicas
- [ ] Login funciona (`prof@demo.com` / `senha123`)
- [ ] Dashboard carrega
- [ ] Pode criar nova apresentação
- [ ] Pode criar aula

### 3. Testar Upload de Arquivos
- [ ] Upload de imagem funciona
- [ ] Upload de PDF funciona
- [ ] Upload de PowerPoint funciona

### 4. Testar PowerPoint (Office 365)
- [ ] Upload .pptx
- [ ] Modo apresentação
- [ ] Office Online renderiza corretamente ✅
- [ ] Navegação entre slides funciona

### 5. Testar Transcrição
- [ ] Modo apresentação com gravação
- [ ] Transcrição em tempo real funciona
- [ ] Áudio é gravado
- [ ] Pode assistir replay

---

## 🔍 Troubleshooting

### Build Failed
```bash
# Verificar logs no Vercel
# Comum: erro de TypeScript

# Testar build localmente:
npm run build

# Se funcionar local mas falhar na Vercel:
# - Verificar node version
# - Verificar dependencies vs devDependencies
```

### Database Connection Error
```bash
# Verificar DATABASE_URL
# Deve ter sslmode=require

# Testar conexão:
npx prisma db pull

# Se falhar:
# - Verificar URL está correta
# - Verificar firewall do banco
# - Verificar SSL está habilitado
```

### 500 Internal Server Error
```bash
# Ver Function Logs no Vercel
# Comum: falta variável de ambiente

# Verificar:
# - DATABASE_URL está configurado
# - AUTH_SECRET está configurado
# - Migrations foram executadas
```

### Upload Não Funciona
```bash
# Vercel tem limite de 4.5MB por request
# Para arquivos maiores:
# - Usar Vercel Blob Storage
# - Ou S3/Cloudflare R2

# Temporário: converter PowerPoint para PDF
```

---

## 📊 Métricas de Sucesso

### Performance
- [ ] Lighthouse Score > 90
- [ ] Time to First Byte < 600ms
- [ ] First Contentful Paint < 1.8s

### Funcionalidade
- [ ] 0 erros no console
- [ ] Todas as rotas funcionando
- [ ] Upload e download funcionando

### Segurança
- [ ] HTTPS habilitado (automático na Vercel)
- [ ] Headers de segurança configurados
- [ ] AUTH_SECRET único e forte

---

## 🎉 Deploy Concluído!

### Próximos Passos
- [ ] Configurar domínio personalizado (opcional)
- [ ] Adicionar Vercel Analytics
- [ ] Configurar Vercel Blob para uploads maiores
- [ ] Monitorar uso e performance
- [ ] Compartilhar com usuários!

---

## 📞 Recursos

- **Dashboard Vercel:** https://vercel.com/dashboard
- **Documentação:** `docs/DEPLOY_GUIDE.md`
- **Variáveis de Ambiente:** `VERCEL_ENV.md`
- **Suporte:** [cloudservo.com.br](https://cloudservo.com.br)

---

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Data do Deploy:** ___/___/2025  
**URL de Produção:** https://________.vercel.app
