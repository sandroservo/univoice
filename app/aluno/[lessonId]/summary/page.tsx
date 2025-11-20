"use client"
import { useEffect, useState } from 'react'

export default function LessonSummary({ params }: { params: { lessonId: string } }) {
  const [data, setData] = useState<any>(null)
  useEffect(()=>{ (async()=>{ const res = await fetch(`/api/lessons/${params.lessonId}/summary`); setData(await res.json()) })() },[params.lessonId])
  if (!data) return <div className="p-6">Carregando...</div>
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Resumo da Aula</h1>
      <div>
        <h2 className="font-medium">Resumo</h2>
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </div>
      <div>
        <h2 className="font-medium">Tópicos</h2>
        <div className="flex flex-wrap gap-2">{data.topics.map((t:string,i:number)=>(<span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{t}</span>))}</div>
      </div>
      <div>
        <h2 className="font-medium">Palavras-chave</h2>
        <div className="flex flex-wrap gap-2">{data.keywords.map((t:string,i:number)=>(<span key={i} className="px-2 py-1 bg-gray-200 rounded text-sm">{t}</span>))}</div>
      </div>
      <div>
        <h2 className="font-medium">Materiais</h2>
        <ul className="list-disc ml-5">
          {data.materials.map((m:any)=> (<li key={m.id}><a className="text-blue-700 underline" href={m.filePath} target="_blank">{m.type}</a></li>))}
        </ul>
      </div>
    </div>
  )
}
