import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { signSession, verifyPassword } from '@/lib/auth'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return new Response('Unauthorized', { status: 401 })
  const ok = verifyPassword(password, user.passwordSalt, user.passwordHash)
  if (!ok) return new Response('Unauthorized', { status: 401 })
  const token = signSession({ sub: user.id, role: user.role })
  cookies().set('session', token, { httpOnly: true, path: '/', sameSite: 'lax' })
  return Response.json({ ok: true })
}
