import { prisma } from '@/lib/db'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado',
    authSecret: process.env.AUTH_SECRET ? '✅ Configurado' : '❌ Não configurado',
    databaseConnection: '⏳ Testando...',
  }

  // Testar conexão com banco
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.databaseConnection = '✅ Conectado'
  } catch (error) {
    checks.databaseConnection = `❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`
  }

  const allOk = 
    checks.databaseUrl.includes('✅') && 
    checks.authSecret.includes('✅') && 
    checks.databaseConnection.includes('✅')

  return Response.json({
    status: allOk ? 'healthy' : 'unhealthy',
    checks
  }, {
    status: allOk ? 200 : 500
  })
}
