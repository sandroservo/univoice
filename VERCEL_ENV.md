# 🔐 Variáveis de Ambiente - Vercel

## ✅ Variáveis OBRIGATÓRIAS

Adicione estas variáveis no Vercel antes do deploy:

### **1. DATABASE_URL** (Obrigatória)
```
Nome: DATABASE_URL
Valor: postgresql://user:password@host:port/database?sslmode=require
```

**Opções de Banco de Dados:**

#### Vercel Postgres (Recomendado - Integrado)
```
1. No projeto Vercel → Storage
2. Create Database → Postgres
3. Connect to Project
4. ✅ DATABASE_URL é adicionado automaticamente!
```

#### Supabase (Grátis)
```
1. https://supabase.com → New Project
2. Settings → Database → Connection String (Pooling)
3. Copiar: postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
4. Adicionar sslmode=require no final
```

#### Neon (Grátis)
```
1. https://neon.tech → New Project
2. Copiar Connection String
3. Já vem com sslmode=require
```

---

### **2. AUTH_SECRET** (Obrigatória)
```
Nome: AUTH_SECRET
Valor: [string aleatória e segura]
```

**Gerar um secret seguro:**
```bash
# Método 1: OpenSSL
openssl rand -base64 32

# Método 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Método 3: Online
https://generate-secret.vercel.app/32
```

**Exemplo:**
```
AUTH_SECRET=Xk7vP2mN8qR4tY6uI9oP1aS3dF5gH7jK0lZ2xC4vB6nM8
```

---

## 🔧 Como Adicionar na Vercel

### **Via Dashboard (Recomendado):**
```
1. Projeto na Vercel → Settings
2. Environment Variables
3. Add New
   - Name: DATABASE_URL
   - Value: sua_connection_string
   - Environment: Production, Preview, Development
4. Save
5. Repetir para AUTH_SECRET
```

### **Via Vercel CLI:**
```bash
# Instalar CLI
npm i -g vercel

# Adicionar variáveis
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
```

---

## ⚠️ IMPORTANTE: Após Adicionar DATABASE_URL

### **Executar Migrations:**

```bash
# Opção 1: Localmente (apontando para DB de produção)
DATABASE_URL="sua_url_producao" npx prisma db push

# Opção 2: Via Vercel CLI
vercel env pull .env.production.local
npx prisma db push
```

### **Gerar Prisma Client:**
```bash
npx prisma generate
```

---

## 📋 Checklist de Deploy

- [ ] DATABASE_URL configurado
- [ ] AUTH_SECRET gerado e configurado
- [ ] Migrations executadas (prisma db push)
- [ ] Deploy concluído
- [ ] Site acessível
- [ ] Teste de login funciona
- [ ] Upload de arquivos funciona

---

## 🔍 Verificar Configuração

Após deploy, acesse:
```
https://seu-projeto.vercel.app/api/health
```

Se retornar erro de database:
```
1. Verificar DATABASE_URL está correta
2. Verificar sslmode=require no final da URL
3. Verificar firewall do banco permite Vercel
4. Executar migrations: prisma db push
```

---

## 🎯 Exemplo Completo

```bash
# Variáveis de Ambiente na Vercel:

DATABASE_URL=postgresql://postgres.xxxxx:senha@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require

AUTH_SECRET=Xk7vP2mN8qR4tY6uI9oP1aS3dF5gH7jK0lZ2xC4vB6nM8
```

---

## 🚀 Próximos Passos Após Configurar

1. **Fazer deploy** → Vercel detecta mudanças
2. **Aguardar build** → ~2-3 minutos
3. **Acessar URL** → https://seu-projeto.vercel.app
4. **Testar login** → prof@demo.com / senha123
5. **Criar apresentação** → Upload PowerPoint
6. **✅ Funciona!**

---

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Documentação Completa:** `docs/DEPLOY_GUIDE.md`
