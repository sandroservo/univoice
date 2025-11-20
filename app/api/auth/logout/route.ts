import { cookies } from 'next/headers'

export async function POST() {
  cookies().set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 0 })
  return Response.json({ ok: true })
}
