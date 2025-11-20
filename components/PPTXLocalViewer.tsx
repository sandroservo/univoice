"use client"
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

interface Props {
  filePath: string
  slideNumber: number
  isFullscreen: boolean
  onNavigate?: (direction: 'prev' | 'next') => void
  canNavigatePrev?: boolean
  canNavigateNext?: boolean
}

/**
 * Componente que renderiza PowerPoint diretamente no navegador
 * usando pptxjs - FUNCIONA EM LOCALHOST!
 */
export default function PPTXLocalViewer({
  filePath,
  slideNumber,
  isFullscreen,
  onNavigate,
  canNavigatePrev = true,
  canNavigateNext = true
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !scriptsLoaded || !containerRef.current) return

    // Carregar e renderizar PowerPoint
    loadPowerPoint()
  }, [isClient, scriptsLoaded, filePath])

  async function loadPowerPoint() {
    try {
      setLoading(true)
      setError(null)

      const container = containerRef.current
      if (!container) return

      // Limpar conteúdo anterior
      container.innerHTML = ''

      // Verificar se pptxjs está disponível
      if (typeof (window as any).$ === 'undefined' || typeof (window as any).JSZip === 'undefined') {
        console.error('pptxjs dependencies not loaded')
        setError('Bibliotecas necessárias não carregadas')
        setLoading(false)
        return
      }

      // Usar pptxjs para renderizar (jQuery)
      const $ = (window as any).$
      
      $(container).pptxToHtml({
        pptxFileUrl: filePath,
        slidesScale: '100%',
        slideMode: false,
        keyBoardShortCut: false,
        mediaProcess: true
      })

      setLoading(false)
    } catch (err) {
      console.error('Erro ao carregar PowerPoint:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600">Iniciando visualizador...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Carregar scripts do pptxjs via CDN */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('jQuery carregado')}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jszip/2.6.1/jszip.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('JSZip carregado')}
      />
      <Script
        src="https://pptx.js.org/js/filereader.js"
        strategy="afterInteractive"
        onLoad={() => console.log('FileReader carregado')}
      />
      <Script
        src="https://pptx.js.org/js/d3.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('D3 carregado')}
      />
      <Script
        src="https://pptx.js.org/js/nv.d3.min.js"
        strategy="afterInteractive"
        onLoad={() => console.log('NV.D3 carregado')}
      />
      <Script
        src="https://pptx.js.org/js/pptxjs.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('pptxjs carregado')
          setScriptsLoaded(true)
        }}
      />

      <div className="w-full h-full flex flex-col bg-white">
        {/* Info Banner */}
        <div className="bg-green-50 border-b-2 border-green-200 p-3 text-sm">
          <p className="text-green-900">
            ✅ <strong>Renderização Local:</strong> PowerPoint sendo processado no seu navegador (funciona em localhost!)
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <p className="text-gray-600">Carregando PowerPoint...</p>
              <p className="text-xs text-gray-500 mt-2">Processando slides no navegador</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Erro ao Carregar</h3>
              <p className="text-red-800 mb-4">{error}</p>
              <button
                onClick={loadPowerPoint}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* PowerPoint Container */}
        <div
          ref={containerRef}
          className={`flex-1 overflow-auto ${loading ? 'hidden' : ''}`}
          style={{
            minHeight: isFullscreen ? '100vh' : '60vh'
          }}
        />

        {/* Navigation Controls */}
        {onNavigate && !loading && (
          <div className="border-t-2 bg-gray-50 p-4 flex gap-3 justify-center">
            <button
              onClick={() => onNavigate('prev')}
              disabled={!canNavigatePrev}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              ← Slide Anterior
            </button>
            <button
              onClick={() => onNavigate('next')}
              disabled={!canNavigateNext}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Próximo Slide →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
