"use client"
import { useState } from 'react'

export default function UploadForm({ lessonId }: { lessonId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState('IMAGE')
  const [status, setStatus] = useState('')
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('lessonId', lessonId)
    fd.append('type', type)
    fd.append('file', file)
    setStatus('Enviando...')
    const res = await fetch('/api/materials/upload', { method: 'POST', body: fd })
    setStatus(res.ok ? 'Enviado' : 'Erro')
  }
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <select value={type} onChange={e=>setType(e.target.value)} className="border rounded p-2">
        <option value="IMAGE">Imagem</option>
        <option value="PDF">PDF</option>
        <option value="VIDEO">Vídeo</option>
      </select>
      <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} className="block" />
      <button className="bg-blue-600 text-white px-3 py-2 rounded">Enviar</button>
      <span className="ml-2 text-sm">{status}</span>
    </form>
  )
}
