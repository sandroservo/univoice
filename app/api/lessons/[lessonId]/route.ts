import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId }, include: { slides: { orderBy: { order: 'asc' } }, segments: { orderBy: { startTime: 'asc' } }, materials: true } })
  return Response.json({ lesson })
}
