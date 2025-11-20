import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const { text, startTime, endTime, slideIndex } = await req.json()
  const seg = await prisma.transcriptSegment.create({ data: { lessonId: params.lessonId, text, startTime, endTime, slideIndex } })
  return Response.json({ segment: seg })
}

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const segments = await prisma.transcriptSegment.findMany({ where: { lessonId: params.lessonId }, orderBy: { startTime: 'asc' } })
  return Response.json({ segments })
}
