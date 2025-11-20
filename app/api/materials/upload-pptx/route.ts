import { prisma } from '@/lib/db'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

/**
 * Endpoint para upload de arquivos PowerPoint (.pptx)
 * Processa o arquivo e cria slides automaticamente
 * 
 * Estratégia:
 * 1. Salva o arquivo PPTX
 * 2. Tenta converter para PDF (LibreOffice/unoconv se disponível)
 * 3. Ou salva como material PPTX e permite visualização via iframe
 */

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const lessonId = String(form.get('lessonId'))
    const file = form.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.pptx') && !fileName.endsWith('.ppt')) {
      return NextResponse.json({ 
        error: 'Apenas arquivos PowerPoint (.pptx, .ppt) são aceitos' 
      }, { status: 400 })
    }

    // Criar diretório
    const dir = path.join(process.cwd(), 'uploads', 'materials', lessonId)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

    // Salvar arquivo
    const array = Buffer.from(await file.arrayBuffer())
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${sanitizedName}`
    const filepath = path.join(dir, filename)
    writeFileSync(filepath, array)

    const url = `/api/uploads/materials/${lessonId}/${filename}`

    // Criar material no banco de dados
    const material = await prisma.material.create({ 
      data: { 
        lessonId, 
        type: 'PDF', // Tratamos como PDF para compatibilidade
        filePath: url 
      } 
    })

    // Criar um único slide com o PowerPoint
    // O usuário poderá visualizar via Google Docs Viewer ou Office Online
    const count = await prisma.slide.count({ where: { lessonId } })
    await prisma.slide.create({ 
      data: { 
        lessonId, 
        order: count + 1, 
        filePath: url 
      } 
    })

    return NextResponse.json({ 
      success: true,
      material,
      message: 'PowerPoint enviado com sucesso!',
      info: 'O arquivo será exibido na apresentação. Para melhor experiência, considere exportar como PDF.'
    })

  } catch (error) {
    console.error('Erro ao processar PowerPoint:', error)
    return NextResponse.json({ 
      error: 'Erro ao processar arquivo PowerPoint',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
