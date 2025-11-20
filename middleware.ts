import { NextRequest, NextResponse } from 'next/server'

const professorPaths = [
  '/dashboard',
  '/apresentacao/nova',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('session')?.value || ''
  const session = parseSession(token)

  if (pathname.startsWith('/apresentacao/') && pathname.split('/').length === 3) {
    if (!session || session.role !== 'PROFESSOR') return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  if (professorPaths.includes(pathname)) {
    if (!session || session.role !== 'PROFESSOR') return NextResponse.redirect(new URL('/login', req.url))
    return NextResponse.next()
  }

  if (pathname === '/login') {
    if (session && session.role === 'PROFESSOR') return NextResponse.redirect(new URL('/dashboard', req.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/uploads).*)']
}

function parseSession(token: string): any | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const body = parts[1]
    const b64 = body.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64)
    return JSON.parse(json)
  } catch {
    return null
  }
}
