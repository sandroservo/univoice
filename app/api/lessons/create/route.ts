import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { courseId, title } = await req.json()
  const lesson = await prisma.lesson.create({ data: { courseId, title } })
  return Response.json({ lesson })
}
