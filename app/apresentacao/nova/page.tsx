"use client"
import { useState } from 'react'
import UploadForm from '@/components/UploadForm'

export default function NovaApresentacao() {
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [title, setTitle] = useState('Minha Aula')
  const [created, setCreated] = useState(false)

  async function createLesson() {
    try {
      const res = await fetch('/api/lessons/create', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title }) 
      })
      
      if (!res.ok) {
        const error = await res.json()
        alert(`Erro: ${error.error || 'Não foi possível criar a aula'}`)
        return
      }
      
      const data = await res.json()
      setLessonId(data.lesson.id)
      setCreated(true)
    } catch (error) {
      console.error('Erro ao criar aula:', error)
      alert('Erro ao criar aula. Verifique a conexão com o servidor.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Nova Apresentação</h1>
      {!created ? (
        <div className="space-y-2">
          <input className="border rounded p-2 w-full" value={title} onChange={e=>setTitle(e.target.value)} />
          <button onClick={createLesson} className="bg-green-600 text-white px-4 py-2 rounded">Criar Aula</button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm">Aula criada: {lessonId}</p>
          {lessonId && <UploadForm lessonId={lessonId} />}
          {lessonId && <a className="inline-block bg-indigo-600 text-white px-4 py-2 rounded" href={`/apresentacao/${lessonId}`}>Ir para Modo Apresentação</a>}
        </div>
      )}
    </div>
  )
}
