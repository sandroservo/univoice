# 📊 Integração com Microsoft Office 365

Guia completo de integração do UniVoice com Microsoft Office 365 para visualização e manipulação de arquivos PowerPoint.

## 🎯 Visão Geral

O UniVoice oferece 3 níveis de integração com Office 365:

1. **Office Online Viewer** (Implementado) - Visualização básica grátis
2. **Microsoft Graph API** (Avançado) - Acesso completo com autenticação
3. **WOPI Protocol** (Empresarial) - Edição colaborativa em tempo real

---

## 1️⃣ Office Online Viewer (Atual)

### ✅ **Funcionalidades**
- Visualização gratuita de PowerPoint, Word, Excel
- Sem necessidade de autenticação
- Suporta .pptx, .ppt, .docx, .doc, .xlsx, .xls

### ⚙️ **Como Funciona**
```typescript
// URL pública do arquivo
const publicUrl = 'https://seusite.com/arquivo.pptx'

// Visualizador Office Online
const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`
```

### 🚫 **Limitações**
- ❌ Requer URL publicamente acessível
- ❌ Não funciona em localhost (desenvolvimento)
- ❌ Apenas visualização (sem edição)
- ❌ Limitações de rate limiting

### 💡 **Solução para Localhost**

#### **Opção A: ngrok (Recomendado)**
```bash
# Instalar ngrok
npm install -g ngrok

# Criar túnel público
ngrok http 3000

# Resultado: https://abc123.ngrok.io
```

Adicionar no `.env.local`:
```bash
NEXT_PUBLIC_NGROK_URL=https://abc123.ngrok.io
```

Reiniciar servidor:
```bash
npm run dev
```

#### **Opção B: localtunnel**
```bash
npm install -g localtunnel
lt --port 3000
```

#### **Opção C: Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:3000
```

---

## 2️⃣ Microsoft Graph API (Avançado)

### ✅ **Funcionalidades**
- Acesso completo ao OneDrive/SharePoint
- Visualização E edição de documentos
- Gerenciamento de permissões
- Versionamento de arquivos
- Colaboração em tempo real

### 📋 **Requisitos**
1. Conta Microsoft 365 (ou Azure AD)
2. Registrar aplicativo no Azure Portal
3. Configurar permissões de API

### 🔧 **Setup**

#### **1. Registrar App no Azure**

1. Acesse [Azure Portal](https://portal.azure.com)
2. Azure Active Directory → App Registrations → New Registration
3. Configure:
   - Nome: "UniVoice"
   - Tipo de conta: Multitenant
   - Redirect URI: `http://localhost:3000/api/auth/callback/microsoft`

4. Copie:
   - Application (client) ID
   - Directory (tenant) ID

5. Certificates & secrets → New client secret
   - Copie o valor do secret

#### **2. Configurar Permissões**

API Permissions → Add permission → Microsoft Graph:

**Delegated Permissions:**
- `Files.Read.All` - Ler arquivos
- `Files.ReadWrite.All` - Ler e escrever
- `User.Read` - Informações do usuário
- `Sites.Read.All` - Ler sites SharePoint

**Application Permissions (opcional):**
- `Files.Read.All`
- `Sites.Read.All`

#### **3. Adicionar Variáveis de Ambiente**

`.env.local`:
```bash
# Microsoft Graph API
MICROSOFT_CLIENT_ID=seu-client-id
MICROSOFT_CLIENT_SECRET=seu-client-secret
MICROSOFT_TENANT_ID=seu-tenant-id
NEXT_PUBLIC_MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/callback/microsoft

# Office 365
NEXT_PUBLIC_OFFICE_365_ENABLED=true
```

#### **4. Instalar Dependências**

```bash
npm install @azure/msal-node @microsoft/microsoft-graph-client
```

#### **5. Exemplo de Implementação**

```typescript
// lib/microsoft-graph.ts
import { Client } from '@microsoft/microsoft-graph-client'
import { ConfidentialClientApplication } from '@azure/msal-node'

const msalConfig = {
  auth: {
    clientId: process.env.MICROSOFT_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!
  }
}

const msalClient = new ConfidentialClientApplication(msalConfig)

export async function getGraphClient(accessToken: string) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    }
  })
}

// Upload arquivo para OneDrive
export async function uploadToOneDrive(
  accessToken: string,
  fileName: string,
  fileBuffer: Buffer
) {
  const client = await getGraphClient(accessToken)
  
  const result = await client
    .api(`/me/drive/root:/${fileName}:/content`)
    .put(fileBuffer)
  
  return result
}

// Obter link de compartilhamento
export async function getShareLink(
  accessToken: string,
  itemId: string
) {
  const client = await getGraphClient(accessToken)
  
  const permission = await client
    .api(`/me/drive/items/${itemId}/createLink`)
    .post({
      type: 'view',
      scope: 'anonymous'
    })
  
  return permission.link.webUrl
}
```

---

## 3️⃣ WOPI Protocol (Empresarial)

### ✅ **Funcionalidades**
- Edição colaborativa em tempo real
- Co-autoria de documentos
- Histórico completo de versões
- Bloqueio de arquivos
- Integração completa Office Online

### 📋 **Requisitos**
- Office 365 Enterprise
- Servidor WOPI implementado
- Certificado SSL válido
- Domínio público

### 🔧 **Setup Básico**

```typescript
// WOPI host configuration
interface WOPIConfig {
  filesUrl: string // URL base para arquivos
  hostEditUrl: string // URL do editor
  accessToken: string // Token de acesso
}

// Endpoint WOPI CheckFileInfo
export async function checkFileInfo(fileId: string) {
  return {
    BaseFileName: 'apresentacao.pptx',
    Size: 1024000,
    UserId: 'user123',
    UserFriendlyName: 'João Silva',
    ReadOnly: false,
    SupportsUpdate: true,
    SupportsLocks: true,
    UserCanWrite: true
  }
}
```

---

## 🚀 Fluxo Recomendado de Integração

### **Fase 1: Desenvolvimento Local (Atual)**
```
✅ Office Online Viewer com ngrok
→ Desenvolvimento rápido
→ Testes básicos de visualização
```

### **Fase 2: Staging**
```
✅ Office Online Viewer em domínio público
→ Funciona automaticamente
→ URL pública acessível
```

### **Fase 3: Produção**
```
✅ Microsoft Graph API
→ Autenticação de usuários
→ Upload direto para OneDrive
→ Compartilhamento avançado
```

### **Fase 4: Enterprise**
```
✅ WOPI Protocol
→ Edição colaborativa
→ Co-autoria em tempo real
→ Integração total Office 365
```

---

## 📝 Exemplos de Uso

### **1. Visualização Básica**

```tsx
import { getOfficeViewerUrl } from '@/lib/office365'

function PowerPointViewer({ fileUrl }) {
  const viewerUrl = getOfficeViewerUrl(fileUrl)
  
  return (
    <iframe 
      src={viewerUrl}
      width="100%"
      height="600px"
    />
  )
}
```

### **2. Com Microsoft Graph**

```tsx
async function handleUploadToOneDrive() {
  // 1. Autenticar usuário
  const { accessToken } = await signIn('microsoft')
  
  // 2. Upload arquivo
  const result = await uploadToOneDrive(
    accessToken,
    'apresentacao.pptx',
    fileBuffer
  )
  
  // 3. Obter link compartilhável
  const shareLink = await getShareLink(
    accessToken,
    result.id
  )
  
  // 4. Usar no Office Online
  const viewerUrl = getOfficeViewerUrl(shareLink)
}
```

---

## 🔒 Segurança

### **Boas Práticas**

1. **Tokens de Acesso**
   - Nunca expor no frontend
   - Usar HTTPS sempre
   - Implementar refresh tokens
   - Expiração adequada

2. **Validação**
   - Verificar tipos de arquivo
   - Limitar tamanho de upload
   - Sanitizar nomes de arquivos
   - Validar permissões

3. **Privacidade**
   - URLs temporárias
   - Tokens de acesso limitados
   - Logs de auditoria
   - GDPR compliance

---

## 📊 Comparação de Opções

| Recurso | Office Viewer | Graph API | WOPI |
|---------|--------------|-----------|------|
| **Custo** | Grátis | Grátis* | Enterprise |
| **Visualização** | ✅ | ✅ | ✅ |
| **Edição** | ❌ | ✅ | ✅ |
| **Colaboração** | ❌ | ⚠️ | ✅ |
| **Autenticação** | ❌ | ✅ | ✅ |
| **Localhost** | ❌ | ✅ | ❌ |
| **Complexidade** | Baixa | Média | Alta |

*Grátis com conta Microsoft

---

## 🆘 Troubleshooting

### **Erro: "Não conseguimos abrir isto"**

**Causa:** URL não é publicamente acessível

**Solução:**
1. Usar ngrok em desenvolvimento
2. Deploy em produção (Vercel, Netlify)
3. Converter para PDF temporariamente

### **Erro: "CORS Policy"**

**Causa:** Configuração CORS incorreta

**Solução:**
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' }
        ]
      }
    ]
  }
}
```

### **Erro: "Authentication Required"**

**Causa:** Microsoft Graph precisa de autenticação

**Solução:**
1. Implementar OAuth 2.0
2. Usar NextAuth.js
3. Configurar provider Microsoft

---

## 📚 Recursos Adicionais

- [Office Online Viewer Documentation](https://docs.microsoft.com/office/dev/add-ins/concepts/browsers-and-office-js-library)
- [Microsoft Graph API](https://docs.microsoft.com/graph/overview)
- [WOPI Protocol](https://docs.microsoft.com/microsoft-365/cloud-storage-partner-program/online/overview)
- [Azure App Registration](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)

---

## ✅ Checklist de Implementação

- [x] Office Online Viewer básico
- [x] Componente OfficePowerPointViewer
- [x] Detecção de localhost
- [x] Guia de configuração ngrok
- [ ] Microsoft Graph API integration
- [ ] OAuth 2.0 authentication
- [ ] Upload para OneDrive
- [ ] WOPI Protocol (futuro)

---

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Projeto:** UniVoice - Plataforma de Apresentações com Transcrição  
**Última atualização:** 2025
