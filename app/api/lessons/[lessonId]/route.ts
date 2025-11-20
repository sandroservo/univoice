import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({ 
    where: { id: params.lessonId }, 
    include: { 
      Slide: { orderBy: { order: 'asc' } }, 
      TranscriptSegment: { orderBy: { startTime: 'asc' } }, 
      Material: true 
    } 
  })
  return Response.json({ lesson })
}
