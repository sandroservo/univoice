import { prisma } from '@/lib/db'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const form = await req.formData()
  const lessonId = String(form.get('lessonId'))
  const type = String(form.get('type'))
  const file = form.get('file') as File
  if (!file) return new Response('No file', { status: 400 })
  const dir = path.join(process.cwd(), 'uploads', 'materials', lessonId)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const array = Buffer.from(await file.arrayBuffer())
  const filename = `${Date.now()}-${file.name}`
  const fp = path.join(dir, filename)
  writeFileSync(fp, array)
  const url = `/api/uploads/materials/${lessonId}/${filename}`
  const mat = await prisma.material.create({ data: { lessonId, type: type as any, filePath: url } })
  if (type === 'IMAGE') {
    const count = await prisma.slide.count({ where: { lessonId } })
    await prisma.slide.create({ data: { lessonId, order: count + 1, filePath: url } })
  }
  return Response.json({ material: mat })
}
