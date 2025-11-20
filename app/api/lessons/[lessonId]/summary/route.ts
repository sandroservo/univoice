import { prisma } from '@/lib/db'
import { summarize } from '@/lib/summarize'

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId }, include: { segments: { orderBy: { startTime: 'asc' } }, materials: true } })
  if (!lesson) return new Response('Not found', { status: 404 })
  const fullText = lesson.segments.map(s=>s.text).join(' ')
  const { summary, keywords, topics } = summarize(fullText)
  return Response.json({ summary, keywords, topics, materials: lesson.materials, transcript: lesson.segments })
}
