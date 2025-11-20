# 🚀 Guia de Deploy - UniVoice

## 📋 Pré-requisitos

- Conta no GitHub
- Conta na Vercel (pode usar login do GitHub)
- Projeto pronto (✅ já está!)

---

## 🌐 Passo 1: Criar Repositório no GitHub

### **1.1 Acessar GitHub:**
```
https://github.com/new
```

### **1.2 Configurar Repositório:**
```
Repository name: univoice
Description: Plataforma de apresentações com transcrição de voz
Visibility: Public (ou Private, sua escolha)

❌ NÃO marcar "Initialize with README" (já temos!)
❌ NÃO adicionar .gitignore (já temos!)
❌ NÃO escolher license (já temos!)
```

### **1.3 Criar Repositório:**
- Clicar em "Create repository"

---

## 🔗 Passo 2: Conectar Local ao GitHub

### **2.1 Copiar URL do Repositório:**
Após criar, GitHub mostrará a URL:
```
https://github.com/SEU_USUARIO/univoice.git
```

### **2.2 Adicionar Remote:**
```bash
cd /home/developer/univoice
git remote add origin https://github.com/SEU_USUARIO/univoice.git
```

### **2.3 Fazer Push:**
```bash
git branch -M main
git push -u origin main
```

Se pedir autenticação:
- Username: seu usuário do GitHub
- Password: usar **Personal Access Token** (não senha)

#### Como criar Token:
```
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Marcar: repo (full control)
5. Generate token
6. Copiar token e usar como senha
```

---

## ☁️ Passo 3: Deploy na Vercel

### **3.1 Acessar Vercel:**
```
https://vercel.com/
```

### **3.2 Login:**
- Clicar em "Continue with GitHub"
- Autorizar Vercel a acessar GitHub

### **3.3 Importar Projeto:**
```
1. New Project
2. Import Git Repository
3. Selecionar "univoice"
4. Import
```

### **3.4 Configurar Projeto:**

**Framework Preset:**
- ✅ Next.js (detectado automaticamente)

**Root Directory:**
- ✅ ./ (padrão)

**Build Command:**
- ✅ npm run build (padrão)

**Output Directory:**
- ✅ .next (padrão)

**Environment Variables:**
Adicionar:
```
DATABASE_URL=sua_database_url_aqui
AUTH_SECRET=seu_secret_aqui
```

> ⚠️ **IMPORTANTE:** Você precisará de um banco PostgreSQL para produção!

### **3.5 Deploy:**
- Clicar em "Deploy"
- Aguardar build (~2-3 minutos)
- ✅ Deploy concluído!

---

## 🗄️ Passo 4: Configurar Banco de Dados (Produção)

### **Opção A: Vercel Postgres (Recomendado)**

```
1. No projeto Vercel → Storage
2. Create Database → Postgres
3. Conectar ao projeto
4. DATABASE_URL é adicionado automaticamente
```

### **Opção B: Supabase (Grátis)**

```
1. https://supabase.com
2. New Project
3. Copiar Connection String (Pooling)
4. Adicionar em Vercel → Environment Variables
   Nome: DATABASE_URL
   Value: postgresql://...
```

### **Opção C: Neon (Grátis)**

```
1. https://neon.tech
2. Create Project
3. Copiar Connection String
4. Adicionar em Vercel → Environment Variables
```

### **4.1 Executar Migrations:**

Após configurar DATABASE_URL:
```bash
# Localmente, apontando para DB de produção:
DATABASE_URL="sua_url_de_producao" npx prisma db push

# Ou via Vercel CLI:
vercel env pull
npx prisma db push
```

---

## 🎯 Passo 5: Verificar Deploy

### **5.1 Acessar URL:**
```
https://univoice.vercel.app
ou
https://seu-projeto-xyz.vercel.app
```

### **5.2 Testar Funcionalidades:**
```
✅ Login funciona
✅ Criar apresentação
✅ Upload de arquivos
✅ PowerPoint (Office Online funcionará!)
✅ Transcrição de voz
```

---

## 📊 PowerPoint em Produção

### **✅ Office Online Viewer:**
Em domínio público (Vercel), o **Office Online funciona automaticamente**!

```
Upload .pptx → Office Online renderiza → ✅ Perfeito!
```

Não precisa de:
- ❌ ngrok
- ❌ localtunnel  
- ❌ Configurações extras
- ❌ .env.local NGROK_URL

**Funciona out-of-the-box!** 🎉

---

## 🔄 Passo 6: Atualizações Futuras

### **6.1 Fazer Mudanças:**
```bash
# Código local
git add .
git commit -m "feat: nova funcionalidade"
git push
```

### **6.2 Deploy Automático:**
```
Vercel detecta push → Build automático → Deploy! ✅
```

---

## ⚙️ Variáveis de Ambiente Necessárias

### **Produção (Vercel):**
```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=algum_secret_seguro_aqui
```

### **Opcional:**
```bash
# Apenas se quiser Analytics
NEXT_PUBLIC_ANALYTICS_ID=...
```

---

## 🆘 Troubleshooting

### **Problema: Build Failed**
```
Solução: Verificar logs no Vercel
Comum: Erro de tipo TypeScript
Fix: npm run build localmente primeiro
```

### **Problema: Database Connection Failed**
```
Solução: Verificar DATABASE_URL
Testar: npx prisma db pull
```

### **Problema: 500 Error**
```
Solução: Ver Function Logs no Vercel
Comum: Falta variável de ambiente
```

### **Problema: Upload não funciona**
```
Solução: Vercel tem limite de 4.5MB por request
Fix: Aumentar em vercel.json ou usar storage externo
```

---

## 📈 Melhorias Pós-Deploy

### **1. Domínio Personalizado:**
```
Vercel → Settings → Domains
Adicionar: seudominio.com
Configurar DNS
```

### **2. Storage para Uploads:**
```
Opções:
- Vercel Blob Storage
- AWS S3
- Cloudinary
- Supabase Storage
```

### **3. Analytics:**
```
Vercel Analytics (integrado)
ou
Google Analytics
```

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código pushed para GitHub
- [ ] Projeto importado na Vercel
- [ ] DATABASE_URL configurado
- [ ] Migrations executadas
- [ ] Deploy bem-sucedido
- [ ] Site acessível
- [ ] Login funciona
- [ ] Upload funciona
- [ ] PowerPoint renderiza
- [ ] Transcrição funciona

---

## 🎉 Pronto!

Seu **UniVoice** está no ar! 🚀

URL de exemplo: `https://univoice.vercel.app`

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Data:** 2025  
**Stack:** Next.js 14, PostgreSQL, Prisma, TypeScript
