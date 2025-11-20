import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { courseId, title } = await req.json()
    
    // Validar título
    if (!title || title.trim() === '') {
      return Response.json({ 
        error: 'Título da aula é obrigatório' 
      }, { status: 400 })
    }

    // Criar lesson (courseId é opcional, id será gerado automaticamente)
    const lesson = await prisma.lesson.create({ 
      data: { 
        title: title.trim(),
        ...(courseId && { courseId })
      } 
    })
    
    return Response.json({ lesson })
  } catch (error) {
    console.error('❌ Erro ao criar lesson:', error)
    return Response.json({ 
      error: 'Erro ao criar aula',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
