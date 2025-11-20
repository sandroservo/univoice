"use client"
import { useState, useEffect } from 'react'
import { 
  getOfficeViewerUrl, 
  getPublicFileUrl, 
  isLocalhost, 
  getDevelopmentTunnelInstructions,
  getOfficeAlternatives 
} from '@/lib/office365'

interface Props {
  filePath: string
  slideNumber: number
  isFullscreen: boolean
  onNavigate?: (direction: 'prev' | 'next') => void
  canNavigatePrev?: boolean
  canNavigateNext?: boolean
}

export default function OfficePowerPointViewer({ 
  filePath, 
  slideNumber, 
  isFullscreen,
  onNavigate,
  canNavigatePrev = true,
  canNavigateNext = true
}: Props) {
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [viewerError, setViewerError] = useState(false)
  const [showTunnelGuide, setShowTunnelGuide] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLocal, setIsLocal] = useState(false)
  
  const alternatives = getOfficeAlternatives()
  
  // Executar apenas no cliente para evitar erro de hidratação
  useEffect(() => {
    setIsClient(true)
    setIsLocal(isLocalhost())
  }, [])
  
  const publicUrl = isClient ? getPublicFileUrl(filePath) : filePath
  const viewerUrl = getOfficeViewerUrl(publicUrl)
  
  useEffect(() => {
    // Detectar erro de carregamento do iframe
    const timer = setTimeout(() => {
      // Se está em localhost, assumir que pode ter erro
      if (isLocal) {
        setViewerError(true)
      }
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [isLocal])

  // Aguardar hidratação do cliente
  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">Carregando PowerPoint...</p>
        </div>
      </div>
    )
  }

  // Ambiente de desenvolvimento local - mostrar aviso
  if (isLocal && !process.env.NEXT_PUBLIC_NGROK_URL) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <div className="max-w-3xl bg-white rounded-xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="text-7xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              PowerPoint Detectado
            </h2>
            <p className="text-gray-600">
              {filePath.split('/').pop()}
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Ambiente Local Detectado</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Microsoft Office Online Viewer precisa de uma <strong>URL pública</strong> para 
                  acessar o arquivo. Como você está em <code className="bg-blue-100 px-2 py-1 rounded">localhost</code>, 
                  o arquivo não é acessível externamente.
                </p>
              </div>
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Escolha uma opção:</h3>

            {/* Opção 1: Download */}
            <a
              href={filePath}
              download
              className="flex items-center gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg group"
            >
              <span className="text-4xl group-hover:scale-110 transition">⬇️</span>
              <div className="flex-1">
                <div className="font-bold text-lg">Baixar PowerPoint</div>
                <div className="text-sm opacity-90">Abra localmente no Microsoft PowerPoint ou LibreOffice</div>
              </div>
            </a>

            {/* Opção 2: Túnel Público */}
            <button
              onClick={() => setShowTunnelGuide(!showTunnelGuide)}
              className="w-full flex items-center gap-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg group"
            >
              <span className="text-4xl group-hover:scale-110 transition">🌐</span>
              <div className="flex-1 text-left">
                <div className="font-bold text-lg">Configurar Túnel Público (ngrok)</div>
                <div className="text-sm opacity-90">Torne seu localhost público para usar Office Online</div>
              </div>
              <span className="text-2xl">{showTunnelGuide ? '▼' : '▶'}</span>
            </button>

            {/* Guia do Túnel */}
            {showTunnelGuide && (
              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 space-y-4">
                <h4 className="font-bold text-purple-900">🚀 Como configurar ngrok:</h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">1</span>
                    <div>
                      <strong>Instalar ngrok:</strong>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">npm install -g ngrok</pre>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">2</span>
                    <div>
                      <strong>Executar túnel:</strong>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">ngrok http 3000</pre>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">3</span>
                    <div>
                      <strong>Copiar URL fornecida</strong> (ex: https://abc123.ngrok.io)
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">4</span>
                    <div>
                      <strong>Adicionar no arquivo .env.local:</strong>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">NEXT_PUBLIC_NGROK_URL=https://abc123.ngrok.io</pre>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold">5</span>
                    <div>
                      <strong>Reiniciar servidor:</strong>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">npm run dev</pre>
                    </div>
                  </li>
                </ol>
                <div className="bg-white border border-purple-300 rounded p-3">
                  <p className="text-xs text-purple-900">
                    ✅ <strong>Depois disso:</strong> Office Online funcionará normalmente!
                  </p>
                </div>
              </div>
            )}

            {/* Opção 3: Alternativas */}
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="w-full flex items-center gap-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-lg group"
            >
              <span className="text-4xl group-hover:scale-110 transition">📄</span>
              <div className="flex-1 text-left">
                <div className="font-bold text-lg">Ver Alternativas (PDF, Imagens)</div>
                <div className="text-sm opacity-90">Outras formas de usar seu PowerPoint</div>
              </div>
              <span className="text-2xl">{showAlternatives ? '▼' : '▶'}</span>
            </button>

            {/* Lista de Alternativas */}
            {showAlternatives && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alternatives.filter(alt => alt.title !== 'Usar Túnel Público').map((alt, idx) => (
                  <div key={idx} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                    <div className="text-3xl mb-2">{alt.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{alt.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{alt.description}</p>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded block">
                      {alt.action}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navegação */}
          {onNavigate && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => onNavigate('prev')}
                disabled={!canNavigatePrev}
                className="flex-1 bg-gray-200 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                ← Slide Anterior
              </button>
              <button
                onClick={() => onNavigate('next')}
                disabled={!canNavigateNext}
                className="flex-1 bg-gray-200 px-4 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Próximo Slide →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Produção ou ngrok configurado - mostrar viewer
  return (
    <div className="w-full h-full flex flex-col bg-white">
      <iframe
        src={viewerUrl}
        className={`w-full ${isFullscreen ? 'h-screen' : 'h-[65vh]'} border-0`}
        title={`PowerPoint - Slide ${slideNumber}`}
        allowFullScreen
        onError={() => setViewerError(true)}
      />
      <div className="text-center py-2 text-xs text-gray-500">
        Visualizado via Microsoft Office Online
      </div>
    </div>
  )
}
