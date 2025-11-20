/**
 * Biblioteca de integração com Microsoft Office 365
 * Utilitários para trabalhar com arquivos Office na plataforma
 */

/**
 * Gera URL para visualização via Office Online Viewer
 * Requer que a URL seja publicamente acessível
 */
export function getOfficeViewerUrl(fileUrl: string): string {
  // Microsoft Office Online Viewer
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
}

/**
 * Gera URL para edição via Office Online
 * Requer autenticação e permissões adequadas
 */
export function getOfficeEditorUrl(fileUrl: string): string {
  return `https://word.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
}

/**
 * Verifica se é arquivo Office
 */
export function isOfficeFile(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop()
  return ['pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls'].includes(ext || '')
}

/**
 * Detecta tipo de arquivo Office
 */
export function getOfficeFileType(filename: string): 'powerpoint' | 'word' | 'excel' | null {
  const ext = filename.toLowerCase().split('.').pop()
  
  if (['pptx', 'ppt'].includes(ext || '')) return 'powerpoint'
  if (['docx', 'doc'].includes(ext || '')) return 'word'
  if (['xlsx', 'xls'].includes(ext || '')) return 'excel'
  
  return null
}

/**
 * Verifica se está em ambiente de desenvolvimento (localhost)
 */
export function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  
  const hostname = window.location.hostname
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname.startsWith('192.168.') ||
         hostname.startsWith('10.')
}

/**
 * Gera URL pública para o arquivo
 * Em produção, retorna URL completa
 * Em desenvolvimento, pode usar ngrok ou similar
 */
export function getPublicFileUrl(filePath: string): string {
  if (typeof window === 'undefined') return filePath
  
  // Em produção, usar domínio real
  if (!isLocalhost()) {
    return `${window.location.origin}${filePath}`
  }
  
  // Em desenvolvimento, sugerir usar ngrok ou túnel
  // Você pode configurar uma variável de ambiente NEXT_PUBLIC_NGROK_URL
  const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL
  if (ngrokUrl) {
    return `${ngrokUrl}${filePath}`
  }
  
  // Fallback para localhost (não funcionará com Office Online)
  return `${window.location.origin}${filePath}`
}

/**
 * Configuração de integração Office 365
 */
export interface Office365Config {
  clientId?: string // Azure App Registration Client ID
  tenantId?: string // Azure Tenant ID
  redirectUri?: string // OAuth redirect URI
}

/**
 * Instruções para túnel público em desenvolvimento
 */
export function getDevelopmentTunnelInstructions(): string {
  return `
Para usar Office Online em desenvolvimento local, você precisa de uma URL pública.

Opções:

1. ngrok (Recomendado - Grátis)
   - Instalar: npm install -g ngrok
   - Executar: ngrok http 3000
   - Copiar URL: https://xxxx.ngrok.io
   - Adicionar no .env.local: NEXT_PUBLIC_NGROK_URL=https://xxxx.ngrok.io

2. localtunnel
   - Instalar: npm install -g localtunnel
   - Executar: lt --port 3000
   - Usar URL fornecida

3. Cloudflare Tunnel
   - Instalar: cloudflared
   - Executar: cloudflared tunnel --url http://localhost:3000

4. Deploy em produção (melhor opção)
   - Vercel, Netlify, Railway, etc.
   - Office Online funcionará automaticamente
`
}

/**
 * Alternativas quando Office Online não está disponível
 */
export interface OfficeAlternative {
  title: string
  description: string
  action: string
  icon: string
}

export function getOfficeAlternatives(): OfficeAlternative[] {
  return [
    {
      title: 'Converter para PDF',
      description: 'Exporte seu PowerPoint como PDF e faça upload',
      action: 'Arquivo → Salvar Como → PDF',
      icon: '📄'
    },
    {
      title: 'Exportar como Imagens',
      description: 'Salve cada slide como imagem PNG/JPEG',
      action: 'Arquivo → Exportar → PNG',
      icon: '🖼️'
    },
    {
      title: 'Google Slides',
      description: 'Converta via Google Drive e baixe como PDF',
      action: 'Upload no Drive → Abrir com Slides → Download PDF',
      icon: '☁️'
    },
    {
      title: 'Usar Túnel Público',
      description: 'Configure ngrok para tornar localhost público',
      action: 'ngrok http 3000',
      icon: '🌐'
    }
  ]
}
