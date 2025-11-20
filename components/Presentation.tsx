"use client"
import { useEffect, useRef, useState } from 'react'

type Slide = { id: string, filePath: string, order: number }

export default function Presentation({ lessonId, slides }: { lessonId: string, slides: Slide[] }) {
  const [idx, setIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [showGoto, setShowGoto] = useState(false)
  const [gotoValue, setGotoValue] = useState('')
  const [blackScreen, setBlackScreen] = useState(false)
  const [whiteScreen, setWhiteScreen] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startTs = useRef<number | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const rec = useRef<any>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  function now() {
    if (startTs.current === null) startTs.current = Date.now()
    return (Date.now() - startTs.current) / 1000
  }

  async function sendSegment(text: string, startTime: number, endTime: number) {
    await fetch(`/api/lessons/${lessonId}/transcript`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, startTime, endTime, slideIndex: idx }) })
  }

  function startSpeech() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r: any = new SR()
    r.lang = 'pt-BR'
    r.continuous = true
    r.interimResults = true
    let lastStart = now()
    let buffer = ''
    r.onresult = async (e: any) => {
      const res = e.results[e.resultIndex]
      const t = res[0].transcript
      if (res.isFinal) {
        const end = now()
        const text = buffer ? buffer + ' ' + t : t
        buffer = ''
        setTranscript(prev => prev + ' ' + text)
        setInterim('')
        await sendSegment(text, lastStart, end)
        lastStart = now()
      } else {
        setInterim(t)
      }
    }
    r.onend = () => {}
    r.start()
    rec.current = r
  }

  async function startAudio() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
    mr.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      chunks.current = []
      const buf = await blob.arrayBuffer()
      await fetch(`/api/lessons/${lessonId}/audio`, { method: 'POST', body: buf })
    }
    mr.start()
    mediaRecorder.current = mr
  }

  function start() {
    setRecording(true)
    setTranscript('')
    setInterim('')
    startSpeech()
    startAudio()
    startTs.current = Date.now()
  }

  function stop() {
    setRecording(false)
    rec.current?.stop()
    mediaRecorder.current?.stop()
  }

  function prev() { 
    setIdx(i=>Math.max(0, i-1))
    setBlackScreen(false)
    setWhiteScreen(false)
  }
  
  function next() { 
    setIdx(i=>Math.min(slides.length-1, i+1))
    setBlackScreen(false)
    setWhiteScreen(false)
  }

  function goToSlide(index: number) {
    if (index >= 0 && index < slides.length) {
      setIdx(index)
      setShowGoto(false)
      setShowThumbnails(false)
      setBlackScreen(false)
      setWhiteScreen(false)
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  function handleGoto() {
    const num = parseInt(gotoValue)
    if (!isNaN(num)) {
      goToSlide(num - 1)
      setGotoValue('')
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Atalhos de teclado (estilo PowerPoint)
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      // Ignorar se estiver digitando em input
      if (e.target instanceof HTMLInputElement) return

      switch(e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          goToSlide(0)
          break
        case 'End':
          e.preventDefault()
          goToSlide(slides.length - 1)
          break
        case 'f':
        case 'F':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            toggleFullscreen()
          }
          break
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen()
          }
          setShowThumbnails(false)
          setShowGoto(false)
          setShowHelp(false)
          setBlackScreen(false)
          setWhiteScreen(false)
          break
        case 'g':
        case 'G':
          e.preventDefault()
          setShowGoto(true)
          break
        case 't':
        case 'T':
          e.preventDefault()
          setShowThumbnails(!showThumbnails)
          break
        case 'b':
        case 'B':
          e.preventDefault()
          setBlackScreen(!blackScreen)
          setWhiteScreen(false)
          break
        case 'w':
        case 'W':
          e.preventDefault()
          setWhiteScreen(!whiteScreen)
          setBlackScreen(false)
          break
        case 'h':
        case 'H':
        case '?':
          e.preventDefault()
          setShowHelp(!showHelp)
          break
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [idx, slides.length, isFullscreen, showThumbnails, showHelp, blackScreen, whiteScreen])

  // Timer
  useEffect(() => {
    if (recording && !timerInterval.current) {
      timerInterval.current = setInterval(() => {
        setElapsedTime(t => t + 1)
      }, 1000)
    } else if (!recording && timerInterval.current) {
      clearInterval(timerInterval.current)
      timerInterval.current = null
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [recording])

  // Detectar mudança de fullscreen
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(()=>{ startTs.current = Date.now() },[])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center p-4 space-y-4 bg-gray-900 relative">
      {/* Barra de Controles Superior */}
      <div className={`flex items-center justify-between bg-gray-800 p-3 rounded-lg shadow-xl w-full max-w-7xl ${isFullscreen ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
        <div className="flex items-center space-x-3">
          {/* Gravação */}
          {!recording ? (
            <button onClick={start} className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2">
              <span>▶</span> Gravar
            </button>
          ) : (
            <button onClick={stop} className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition animate-pulse flex items-center gap-2">
              <span>⏹</span> Parar
            </button>
          )}
          {/* Timer */}
          {recording && (
            <div className="bg-red-900/30 text-red-200 px-4 py-2 rounded-lg font-mono text-sm">
              🔴 {formatTime(elapsedTime)}
            </div>
          )}
        </div>

        {/* Navegação Central */}
        <div className="flex items-center space-x-2">
          <button onClick={() => goToSlide(0)} className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition" title="Primeiro slide (Home)">
            ⏮
          </button>
          <button onClick={prev} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition" title="Anterior (←)">
            ◀
          </button>
          <div className="bg-gray-700 text-white px-4 py-2 rounded font-semibold min-w-[100px] text-center">
            {idx + 1} / {slides.length}
          </div>
          <button onClick={next} className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition" title="Próximo (→)">
            ▶
          </button>
          <button onClick={() => goToSlide(slides.length - 1)} className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition" title="Último slide (End)">
            ⏭
          </button>
        </div>

        {/* Ferramentas */}
        <div className="flex items-center space-x-2">
          <button onClick={() => setShowGoto(true)} className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition" title="Ir para slide (G)">
            🔢
          </button>
          <button onClick={() => setShowThumbnails(!showThumbnails)} className={`px-3 py-2 rounded transition ${showThumbnails ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`} title="Miniaturas (T)">
            📑
          </button>
          <button onClick={() => setBlackScreen(!blackScreen)} className={`px-3 py-2 rounded transition ${blackScreen ? 'bg-black text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`} title="Tela preta (B)">
            ⬛
          </button>
          <button onClick={() => setWhiteScreen(!whiteScreen)} className={`px-3 py-2 rounded transition ${whiteScreen ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'}`} title="Tela branca (W)">
            ⬜
          </button>
          <button onClick={toggleFullscreen} className={`px-3 py-2 rounded transition ${isFullscreen ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`} title="Tela cheia (F)">
            {isFullscreen ? '⛶' : '⛶'}
          </button>
          <button onClick={() => setShowHelp(!showHelp)} className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600 transition" title="Ajuda (H)">
            ❓
          </button>
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 w-full max-w-7xl flex gap-4 relative">
        {/* Painel de Miniaturas Lateral */}
        {showThumbnails && (
          <div className="w-64 bg-gray-800 rounded-lg shadow-xl p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            <h3 className="text-white font-semibold mb-3 text-sm">SLIDES</h3>
            <div className="space-y-2">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  onClick={() => goToSlide(i)}
                  className={`cursor-pointer rounded-lg p-2 transition ${i === idx ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  <img src={slide.filePath} alt={`Slide ${i + 1}`} className="w-full rounded mb-1" />
                  <p className="text-white text-xs text-center">{i + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide Central */}
        <div className="flex-1 bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden relative">
          {blackScreen ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <p className="text-gray-600 text-sm">Tela preta (pressione B para voltar)</p>
            </div>
          ) : whiteScreen ? (
            <div className="w-full h-full bg-white flex items-center justify-center">
              <p className="text-gray-400 text-sm">Tela branca (pressione W para voltar)</p>
            </div>
          ) : slides[idx] ? (
            <img src={slides[idx].filePath} alt={`Slide ${idx + 1}`} className={`max-w-full ${isFullscreen ? 'max-h-screen' : 'max-h-[65vh]'} object-contain`} />
          ) : (
            <div className="text-gray-400 text-center">
              <p className="text-4xl mb-4">📊</p>
              <p className="text-lg">Nenhum slide disponível</p>
            </div>
          )}

          {/* Contador de Slide no canto (estilo PowerPoint) */}
          {!blackScreen && !whiteScreen && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              {idx + 1} / {slides.length}
            </div>
          )}
        </div>
      </div>

      {/* Área de Transcrição */}
      {!isFullscreen && (
        <div className="w-full max-w-7xl bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-white">
              {recording ? '🔴 Gravando - Transcrição ao Vivo' : '📝 Transcrição'}
            </span>
            {recording && <span className="text-red-400 text-sm animate-pulse">● REC</span>}
          </div>
          <div className="bg-gray-900 rounded-lg p-4 min-h-[8rem] max-h-[12rem] overflow-y-auto">
            <div className="text-gray-200 leading-relaxed">
              {transcript || <span className="text-gray-500 italic">A transcrição aparecerá aqui em tempo real...</span>}
              {interim && <span className="text-blue-400 italic"> {interim}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ir para Slide */}
      {showGoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowGoto(false)}>
          <div className="bg-white rounded-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Ir para Slide</h3>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={slides.length}
                value={gotoValue}
                onChange={e => setGotoValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGoto()}
                placeholder={`1-${slides.length}`}
                className="border-2 border-gray-300 rounded px-4 py-2 w-32 text-lg"
                autoFocus
              />
              <button onClick={handleGoto} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Ir
              </button>
              <button onClick={() => setShowGoto(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajuda */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">⌨️ Atalhos de Teclado</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Navegação</h3>
                <ul className="space-y-2 text-sm">
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">→</kbd> <kbd className="bg-gray-200 px-2 py-1 rounded">↓</kbd> <kbd className="bg-gray-200 px-2 py-1 rounded">Space</kbd> <kbd className="bg-gray-200 px-2 py-1 rounded">PgDn</kbd> - Próximo slide</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">←</kbd> <kbd className="bg-gray-200 px-2 py-1 rounded">↑</kbd> <kbd className="bg-gray-200 px-2 py-1 rounded">PgUp</kbd> - Slide anterior</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">Home</kbd> - Primeiro slide</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">End</kbd> - Último slide</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">G</kbd> - Ir para slide específico</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Visualização</h3>
                <ul className="space-y-2 text-sm">
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">F</kbd> - Tela cheia</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">Esc</kbd> - Sair da tela cheia</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">T</kbd> - Mostrar/ocultar miniaturas</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">B</kbd> - Tela preta</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">W</kbd> - Tela branca</li>
                  <li><kbd className="bg-gray-200 px-2 py-1 rounded">H</kbd> ou <kbd className="bg-gray-200 px-2 py-1 rounded">?</kbd> - Esta ajuda</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">💡 Dica: Use as setas do teclado para navegar rapidamente durante a apresentação!</p>
            </div>
            <button onClick={() => setShowHelp(false)} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
