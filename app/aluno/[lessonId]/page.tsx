"use client"
import { useEffect, useMemo, useRef, useState } from 'react'

type Segment = { startTime: number, endTime: number, slideIndex: number | null, text: string }

export default function StudentPage({ params }: { params: { lessonId: string } }) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [audioPath, setAudioPath] = useState<string | null>(null)
  const [slides, setSlides] = useState<{ filePath: string }[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(()=>{
    ;(async()=>{
      const res = await fetch(`/api/lessons/${params.lessonId}`)
      const { lesson } = await res.json()
      setSegments(lesson.segments)
      setAudioPath(lesson.audioPath || null)
      setSlides(lesson.slides)
    })()
  },[params.lessonId])

  const timeline = useMemo(()=>{
    const t: { time: number, idx: number }[] = []
    for (const s of segments) if (s.slideIndex != null) t.push({ time: s.startTime, idx: s.slideIndex })
    return t.sort((a,b)=>a.time-b.time)
  },[segments])

  function onTimeUpdate() {
    const t = audioRef.current?.currentTime || 0
    for (let i=timeline.length-1;i>=0;i--) if (t >= timeline[i].time) { setCurrentSlide(timeline[i].idx); break }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Replay da Aula</h1>
      {audioPath && <audio ref={audioRef} src={audioPath} controls onTimeUpdate={onTimeUpdate} className="w-full" />}
      <div className="bg-black/5 p-4 rounded min-h-[400px] flex items-center justify-center">
        {slides[currentSlide] && <img src={slides[currentSlide].filePath.replace(process.cwd(), '')} className="max-h-[60vh]" />}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium">Transcrição</h2>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {segments.map((s,i)=> <div key={i}>{s.text}</div>)}
        </div>
      </div>
    </div>
  )
}
