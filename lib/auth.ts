import crypto from 'crypto'

const secret = process.env.AUTH_SECRET || 'dev-secret'

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const computed = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'))
}

export function signSession(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifySession(token: string) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, b, s] = parts
  const sig = crypto.createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(s))) return null
  try {
    return JSON.parse(Buffer.from(b, 'base64url').toString())
  } catch {
    return null
  }
}
