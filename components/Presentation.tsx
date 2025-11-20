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
    r.onresult = async e => {
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
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex items-center space-x-2 p-2">
        {!recording ? <button onClick={start} className="bg-green-600 text-white px-3 py-2 rounded">Iniciar</button> : <button onClick={stop} className="bg-red-600 text-white px-3 py-2 rounded">Parar</button>}
        <button onClick={prev} className="bg-gray-300 px-3 py-2 rounded">Anterior</button>
        <button onClick={next} className="bg-gray-300 px-3 py-2 rounded">Próximo</button>
        <span className="ml-2">Slide {idx+1} de {slides.length}</span>
      </div>
      <div className="w-full max-w-5xl p-4 bg-gray-100 rounded text-sm min-h-[6rem]">
        <div className="text-gray-700">{transcript} <span className="text-gray-400">{interim}</span></div>
      </div>
      <div className="flex-1 w-full max-w-5xl bg-black/5 rounded p-4">
        {slides[idx] ? <img src={slides[idx].filePath} alt="slide" className="mx-auto max-h-[70vh]" /> : null}
      </div>
    </div>
  )
}
