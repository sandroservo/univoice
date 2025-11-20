import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { signSession, verifyPassword } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não configurado')
      return Response.json({ 
        error: 'Configuração do servidor incompleta. DATABASE_URL não definido.' 
      }, { status: 500 })
    }

    if (!process.env.AUTH_SECRET) {
      console.error('❌ AUTH_SECRET não configurado')
      return Response.json({ 
        error: 'Configuração do servidor incompleta. AUTH_SECRET não definido.' 
      }, { status: 500 })
    }

    const { email, password } = await req.json()
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return new Response('Unauthorized', { status: 401 })
    
    const ok = verifyPassword(password, user.passwordSalt, user.passwordHash)
    if (!ok) return new Response('Unauthorized', { status: 401 })
    
    const token = signSession({ sub: user.id, role: user.role })
    cookies().set('session', token, { httpOnly: true, path: '/', sameSite: 'lax' })
    
    return Response.json({ ok: true })
  } catch (error) {
    console.error('❌ Erro no login:', error)
    return Response.json({ 
      error: 'Erro ao processar login',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
