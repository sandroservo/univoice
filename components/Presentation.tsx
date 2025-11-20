"use client"
import { useEffect, useRef, useState } from 'react'

type Slide = { id: string, filePath: string, order: number }

export default function Presentation({ lessonId, slides }: { lessonId: string, slides: Slide[] }) {
  const [idx, setIdx] = useState(0)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const startTs = useRef<number | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const rec = useRef<any>(null)

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

  function prev() { setIdx(i=>Math.max(0, i-1)) }
  function next() { setIdx(i=>Math.min(slides.length-1, i+1)) }

  useEffect(()=>{ startTs.current = Date.now() },[])

  return (
    <div className="w-full h-full flex flex-col items-center p-4 space-y-4">
      {/* Controles de Apresentação */}
      <div className="flex items-center justify-center space-x-3 bg-white p-4 rounded-lg shadow-md w-full max-w-5xl">
        {!recording ? (
          <button onClick={start} className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition">
            ▶ Iniciar Gravação
          </button>
        ) : (
          <button onClick={stop} className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition animate-pulse">
            ⏹ Parar Gravação
          </button>
        )}
        <div className="border-l border-gray-300 h-10"></div>
        <button onClick={prev} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
          ← Anterior
        </button>
        <span className="font-semibold text-gray-700">
          Slide {idx+1} de {slides.length}
        </span>
        <button onClick={next} className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition">
          Próximo →
        </button>
      </div>

      {/* Área do Slide */}
      <div className="flex-1 w-full max-w-5xl bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 flex items-center justify-center">
        {slides[idx] ? (
          <img src={slides[idx].filePath} alt={`Slide ${idx + 1}`} className="max-h-[60vh] max-w-full object-contain rounded shadow-md" />
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-xl mb-2">📊</p>
            <p>Nenhum slide disponível</p>
          </div>
        )}
      </div>

      {/* Área de Transcrição */}
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-3">
          <span className="text-lg font-semibold text-gray-800">
            {recording ? '🔴 Gravando...' : '📝 Transcrição'}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 min-h-[8rem] max-h-[12rem] overflow-y-auto">
          <div className="text-gray-700 leading-relaxed">
            {transcript || <span className="text-gray-400 italic">A transcrição aparecerá aqui em tempo real...</span>}
            {interim && <span className="text-blue-500 italic"> {interim}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
