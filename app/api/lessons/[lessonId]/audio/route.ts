import { prisma } from '@/lib/db'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import path from 'path'

export async function POST(req: Request, { params }: { params: { lessonId: string } }) {
  const buf = Buffer.from(await req.arrayBuffer())
  const dir = path.join(process.cwd(), 'uploads', 'audio', params.lessonId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const fp = path.join(dir, `${Date.now()}.webm`)
  writeFileSync(fp, buf)
  const url = `/api/uploads/audio/${params.lessonId}/${path.basename(fp)}`
  await prisma.lesson.update({ where: { id: params.lessonId }, data: { audioPath: url } })
  return Response.json({ path: url })
}

export async function GET(_req: Request, { params }: { params: { lessonId: string } }) {
  const dir = path.join(process.cwd(), 'uploads', 'audio', params.lessonId)
  const files = ['latest.webm']
  return Response.json({ dir })
}
