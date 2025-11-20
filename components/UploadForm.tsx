"use client"
import { useState } from 'react'

export default function UploadForm({ lessonId }: { lessonId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const [type, setType] = useState('IMAGE')
  const [status, setStatus] = useState('')
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple' | 'powerpoint'>('single')
  const [showPptxGuide, setShowPptxGuide] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (uploadMode === 'multiple' && files && files.length > 0) {
      await uploadMultiple()
    } else if (file) {
      await uploadSingle()
    }
  }

  async function uploadSingle() {
    if (!file) return
    
    // Detectar se é PowerPoint
    const isPptx = file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt')
    const endpoint = isPptx ? '/api/materials/upload-pptx' : '/api/materials/upload'
    
    const fd = new FormData()
    fd.append('lessonId', lessonId)
    if (!isPptx) {
      fd.append('type', type)
    }
    fd.append('file', file)
    setStatus(isPptx ? 'Processando PowerPoint...' : 'Enviando...')
    
    const res = await fetch(endpoint, { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      setUploadCount(prev => prev + 1)
      if (isPptx) {
        setStatus('✅ PowerPoint importado! Clique em "Ir para Modo Apresentação" para ver.')
      } else {
        setStatus('✅ Enviado com sucesso!')
      }
      setFile(null)
      // Limpar input de arquivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      setTimeout(() => setStatus(''), 8000)
    } else {
      setStatus('❌ Erro ao enviar')
    }
  }

  async function uploadMultiple() {
    if (!files) return
    setStatus(`Enviando ${files.length} arquivos...`)
    let success = 0
    
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData()
      fd.append('lessonId', lessonId)
      fd.append('type', 'IMAGE')
      fd.append('file', files[i])
      
      const res = await fetch('/api/materials/upload', { method: 'POST', body: fd })
      if (res.ok) success++
      
      setStatus(`Enviando... ${i + 1}/${files.length}`)
    }
    
    setStatus(`✅ ${success}/${files.length} slides enviados!`)
    setUploadCount(prev => prev + success)
    setFiles(null)
    // Limpar input
    const fileInput = document.querySelectorAll('input[type="file"]')[1] as HTMLInputElement
    if (fileInput) fileInput.value = ''
    setTimeout(() => setStatus(''), 8000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    
    // Auto-detectar tipo do arquivo
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      if (selectedFile.type.startsWith('image/')) {
        setType('IMAGE')
      } else if (selectedFile.type === 'application/pdf') {
        setType('PDF')
      } else if (selectedFile.type.startsWith('video/')) {
        setType('VIDEO')
      } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
        setType('PPTX')
        // Não mostrar mais o guia, já que agora suportamos upload direto
      }
    }
  }

  function handleMultipleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files
    setFiles(selectedFiles)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">📤 Enviar Material</h3>
        {uploadCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              ✅ {uploadCount} {uploadCount === 1 ? 'material enviado' : 'materiais enviados'}
            </span>
            <a 
              href={`/apresentacao/${lessonId}`}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg animate-pulse"
            >
              🎯 Ver Apresentação
            </a>
          </div>
        )}
      </div>
      
      {/* Modo de Upload */}
      <div className="flex gap-2 bg-gray-100 p-2 rounded-lg">
        <button
          type="button"
          onClick={() => setUploadMode('single')}
          className={`flex-1 py-2 px-3 rounded transition text-sm font-medium ${
            uploadMode === 'single' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📄 Arquivo Único
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('multiple')}
          className={`flex-1 py-2 px-3 rounded transition text-sm font-medium ${
            uploadMode === 'multiple' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📚 Múltiplos Slides
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('powerpoint')}
          className={`flex-1 py-2 px-3 rounded transition text-sm font-medium ${
            uploadMode === 'powerpoint' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          📊 PowerPoint
        </button>
      </div>

      {/* Upload Único */}
      {uploadMode === 'single' && (
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
              <option value="IMAGE">🖼️ Imagem (vira slide)</option>
              <option value="PDF">📄 PDF (vira slide)</option>
              <option value="PPTX">📊 PowerPoint (vira slide)</option>
              <option value="VIDEO">🎥 Vídeo (material apoio)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Arquivo
            </label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept={
                type === 'IMAGE' ? 'image/*' : 
                type === 'PDF' ? '.pdf' : 
                type === 'PPTX' ? '.pptx,.ppt' :
                'video/*'
              }
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                {file.name.toLowerCase().endsWith('.pptx') && (
                  <span className="ml-2 text-orange-600 font-semibold">📊 PowerPoint detectado!</span>
                )}
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
      )}

      {/* Upload Múltiplo */}
      {uploadMode === 'multiple' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📚 Upload Múltiplo de Slides</h4>
            <p className="text-sm text-blue-800 mb-3">
              Selecione várias imagens de uma vez. Cada imagem será um slide na ordem selecionada.
            </p>
            <p className="text-xs text-blue-700">
              💡 <strong>Dica:</strong> Se você tem PowerPoint, exporte cada slide como imagem e envie todos de uma vez!
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Múltiplas Imagens
            </label>
            <input 
              type="file" 
              onChange={handleMultipleFilesChange}
              multiple
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {files && files.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                📎 {files.length} arquivos selecionados
              </p>
            )}
          </div>

          <button 
            type="submit"
            disabled={!files || files.length === 0}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {files && files.length > 0 ? `Enviar ${files.length} Slides` : 'Selecione os arquivos'}
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
      )}

      {/* Guia PowerPoint */}
      {uploadMode === 'powerpoint' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📊</div>
              <div className="flex-1">
                <h4 className="font-bold text-xl text-orange-900 mb-3">Como Importar PowerPoint</h4>
                <p className="text-orange-800 mb-4">
                  Há <strong>4 formas</strong> de usar seu PowerPoint no UniVoice:
                </p>
              </div>
            </div>
          </div>

          {/* Opção 0: Upload Direto - NOVO! */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="bg-green-500 text-white font-bold px-3 py-1 rounded-full text-sm">NOVO! ⭐</span>
              <h5 className="font-semibold text-lg text-green-900">📊 Upload Direto do PowerPoint</h5>
            </div>
            <p className="text-green-800 mb-3 font-semibold">
              🎉 Agora você pode enviar o arquivo .pptx DIRETO, sem converter!
            </p>
            <ol className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Volte na aba <strong>"Arquivo Único"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Selecione <strong>"📊 PowerPoint"</strong> no tipo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Escolha seu arquivo <strong>.pptx ou .ppt</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Clique em <strong>"Enviar Material"</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">5.</span>
                <span>✅ Pronto! O PowerPoint aparecerá na apresentação!</span>
              </li>
            </ol>
            <div className="mt-3 bg-white border-2 border-green-400 rounded p-3">
              <p className="text-sm text-green-900 font-semibold">
                ⚡ <strong>Mais Rápido:</strong> Envie direto sem precisar exportar!
              </p>
              <p className="text-xs text-green-800 mt-1">
                O PowerPoint será visualizado via Microsoft Office Online com todos os seus slides.
              </p>
            </div>
          </div>

          {/* Opção 1: PDF */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-sm">Opção 1</span>
              <h5 className="font-semibold text-lg">📄 Exportar como PDF (Mais Fácil)</h5>
            </div>
            <ol className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Abra seu PowerPoint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span><strong>Arquivo → Salvar Como → PDF</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Volte aqui e envie o PDF no modo <strong>"Arquivo Único"</strong></span>
              </li>
            </ol>
            <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-green-800">
                ✅ <strong>Recomendado:</strong> Rápido, mantém formatação, funciona perfeitamente!
              </p>
            </div>
          </div>

          {/* Opção 2: Imagens */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full text-sm">Opção 2</span>
              <h5 className="font-semibold text-lg">🖼️ Exportar como Imagens</h5>
            </div>
            <ol className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>No PowerPoint: <strong>Arquivo → Exportar → Alterar Tipo de Arquivo</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Escolha <strong>PNG</strong> ou <strong>JPEG</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Salve <strong>Todos os Slides</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Volte aqui e envie no modo <strong>"Múltiplos Slides"</strong></span>
              </li>
            </ol>
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Vantagem:</strong> Cada slide vira uma imagem individual com controle total!
              </p>
            </div>
          </div>

          {/* Opção 3: Google Slides */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full text-sm">Opção 3</span>
              <h5 className="font-semibold text-lg">☁️ Via Google Slides</h5>
            </div>
            <ol className="space-y-2 text-sm text-gray-700 ml-6">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Faça upload do PowerPoint no Google Drive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Abra com <strong>Google Slides</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span><strong>Arquivo → Download → PDF</strong> ou <strong>Imagens PNG</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Envie aqui conforme a opção escolhida</span>
              </li>
            </ol>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <button
              onClick={() => setUploadMode('single')}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              📄 Enviar PDF
            </button>
            <button
              onClick={() => setUploadMode('multiple')}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              🖼️ Enviar Imagens
            </button>
          </div>
        </div>
      )}

      {/* Dicas */}
      {uploadMode !== 'powerpoint' && (
        <div className="text-xs text-gray-500 space-y-1 pt-4 border-t">
          <p>💡 <strong>Imagens, PDFs e PowerPoint</strong> viram slides automaticamente!</p>
          <p>📊 <strong>NOVO:</strong> Envie arquivos .pptx direto sem converter!</p>
          <p>❓ <strong>Dúvidas?</strong> Clique na aba "PowerPoint" para ver todas as opções.</p>
        </div>
      )}

      {/* Modal: Guia PPTX detectado */}
      {showPptxGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPptxGuide(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PowerPoint Detectado!</h3>
              <p className="text-gray-600">
                Para usar seu PowerPoint, você precisa convertê-lo primeiro.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  setShowPptxGuide(false)
                  setUploadMode('powerpoint')
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                📖 Ver Guia Completo
              </button>
              <button
                onClick={() => setShowPptxGuide(false)}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Fechar
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p><strong>Dica Rápida:</strong> Salve como PDF e envie!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
