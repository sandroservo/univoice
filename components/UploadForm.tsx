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
    if (res.ok) {
      setStatus('✅ Enviado com sucesso!')
      setFile(null)
      setTimeout(() => setStatus(''), 3000)
    } else {
      setStatus('❌ Erro ao enviar')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    
    // Auto-detectar tipo do arquivo
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        setType('IMAGE')
      } else if (selectedFile.type === 'application/pdf') {
        setType('PDF')
      } else if (selectedFile.type.startsWith('video/')) {
        setType('VIDEO')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">📤 Enviar Material</h3>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Material
          </label>
          <select 
            value={type} 
            onChange={e=>setType(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="IMAGE">🖼️ Imagem (será slide)</option>
            <option value="PDF">📄 PDF (será slide)</option>
            <option value="VIDEO">🎥 Vídeo (material de apoio)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Arquivo
          </label>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept={type === 'IMAGE' ? 'image/*' : type === 'PDF' ? '.pdf' : 'video/*'}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <button 
          type="submit"
          disabled={!file}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {file ? 'Enviar Material' : 'Selecione um arquivo'}
        </button>

        {status && (
          <div className={`p-3 rounded-lg text-center font-medium ${
            status.includes('✅') ? 'bg-green-100 text-green-800' : 
            status.includes('❌') ? 'bg-red-100 text-red-800' : 
            'bg-blue-100 text-blue-800'
          }`}>
            {status}
          </div>
        )}
      </form>

      <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
        <p>💡 <strong>Dica:</strong> Imagens e PDFs viram slides automaticamente!</p>
        <p>📊 Use PDFs com múltiplas páginas para criar apresentações completas.</p>
      </div>
    </div>
  )
}
