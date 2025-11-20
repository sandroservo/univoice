import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  const exists = await prisma.user.findUnique({ where: { email: 'prof@demo.com' } })
  if (!exists) {
    const { salt, hash } = hashPassword('senha123')
    await prisma.user.create({ data: { email: 'prof@demo.com', name: 'Professor Demo', role: 'PROFESSOR', passwordSalt: salt, passwordHash: hash } })
  }
  return Response.json({ ok: true })
}
