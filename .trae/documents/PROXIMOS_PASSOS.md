# 🚀 Próximos Passos Prioritários - UniVoice

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Data:** 20 de Novembro de 2025

---

## ✅ Concluído Agora

- [x] Análise completa do projeto
- [x] Documentação técnica (ANALISE_COMPLETA_E_ROADMAP.md)
- [x] README.md com instruções de uso
- [x] .env.example com todas as variáveis
- [x] .gitignore completo e otimizado

---

## 🔥 Prioridade CRÍTICA (Fazer Hoje)

### 1. Inicializar Controle de Versão
```bash
git init
git add .
git commit -m "feat: Initial commit - UniVoice v0.1.0

- Sistema de autenticação com JWT
- Modo apresentação com transcrição em tempo real
- Portal do aluno com replay sincronizado
- Dashboard básico do professor
- Proteção de rotas com middleware"
```

### 2. Corrigir Bug do Logout
**Arquivo:** `/app/dashboard/page.tsx`

**Problema Atual:**
```typescript
async function logout() {
  'use server'
  await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' })
}
```

**Solução:**
```typescript
async function logout() {
  'use server'
  const { cookies } = await import('next/headers')
  cookies().set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 0 })
  redirect('/login')
}
```

### 3. Adicionar AUTH_SECRET no .env
```bash
# Gerar chave segura
openssl rand -base64 32

# Adicionar no .env
AUTH_SECRET=sua-chave-gerada-aqui
```

### 4. Corrigir Path de Imagens no Aluno
**Arquivo:** `/app/aluno/[lessonId]/page.tsx` linha 39

**Problema:**
```typescript
<img src={slides[currentSlide].filePath.replace(process.cwd(), '')} />
```

**Solução:**
As imagens já vêm com path correto `/api/uploads/...`, remover o replace:
```typescript
<img src={slides[currentSlide].filePath} />
```

---

## 🎯 Alta Prioridade (Esta Semana)

### 5. Adicionar Validação Básica nas APIs

**Criar:** `/lib/validation.ts`
```typescript
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function sanitizeInput(input: string): string {
  return input.trim().substring(0, 1000)
}
```

**Atualizar:** `/app/api/auth/login/route.ts`
```typescript
import { validateEmail } from '@/lib/validation'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  
  if (!validateEmail(email)) {
    return Response.json({ error: 'Email inválido' }, { status: 400 })
  }
  
  if (!password || password.length < 6) {
    return Response.json({ error: 'Senha muito curta' }, { status: 400 })
  }
  
  // ... resto do código
}
```

### 6. Adicionar Tratamento de Erros Global

**Criar:** `/app/error.tsx`
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado</h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

### 7. Implementar Lista de Aulas no Dashboard

**Atualizar:** `/app/dashboard/page.tsx`
```typescript
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function logout() {
  'use server'
  cookies().set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 0 })
  redirect('/login')
}

export default async function Dashboard() {
  const token = cookies().get('session')?.value || ''
  const session = verifySession(token)
  
  if (!session) redirect('/login')
  
  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { slides: true, segments: true }
      }
    }
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Painel do Professor</h1>
        <form action={logout}>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            Sair
          </button>
        </form>
      </div>

      <div className="flex gap-2">
        <Link 
          href="/apresentacao/nova" 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
        >
          + Nova Apresentação
        </Link>
        <Link 
          href="/aluno/demo" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
        >
          Portal do Aluno (demo)
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Minhas Aulas</h2>
        </div>
        
        {lessons.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>Nenhuma aula criada ainda.</p>
            <p className="text-sm mt-2">Clique em "Nova Apresentação" para começar!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {lessons.map(lesson => (
              <div key={lesson.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {lesson.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span>{lesson._count.slides} slides</span>
                      <span>•</span>
                      <span>{lesson._count.segments} segmentos</span>
                      <span>•</span>
                      <span>{new Date(lesson.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      href={`/apresentacao/${lesson.id}`}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm font-medium"
                    >
                      Apresentar
                    </Link>
                    <Link
                      href={`/aluno/${lesson.id}`}
                      className="text-green-600 hover:text-green-800 px-3 py-1 text-sm font-medium"
                    >
                      Ver como Aluno
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📱 Média Prioridade (Próxima Semana)

### 8. Adicionar Responsividade Mobile

**Criar:** `/app/globals.css` (adicionar)
```css
/* Melhorias de responsividade */
@media (max-width: 768px) {
  .max-w-3xl, .max-w-4xl, .max-w-5xl {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Ajustar botões em mobile */
  .space-x-2 > * {
    margin-bottom: 0.5rem;
  }
}
```

### 9. Adicionar Loading States

**Criar:** `/components/LoadingSpinner.tsx`
```typescript
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
```

### 10. Implementar Toast de Notificações

**Criar:** `/components/Toast.tsx`
```typescript
'use client'
import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'info', duration = 3000 }: {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!visible) return null

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up`}>
      {message}
    </div>
  )
}
```

---

## 🔮 Baixa Prioridade (Futuro Próximo)

### 11. Adicionar Testes
- Configurar Jest
- Testes unitários para `lib/auth.ts`
- Testes de integração para APIs
- E2E com Playwright

### 12. Configurar CI/CD
- GitHub Actions
- Deploy automático na Vercel
- Preview deployments

### 13. Implementar Analytics Básico
- Tracking de visualizações
- Tempo médio de aula
- Taxa de conclusão

---

## 📋 Checklist de Deploy para Produção

Antes de fazer deploy, certifique-se de:

- [ ] AUTH_SECRET com chave forte (32+ caracteres)
- [ ] DATABASE_URL apontando para produção
- [ ] Configurar Object Storage (S3/R2) para uploads
- [ ] Adicionar HTTPS obrigatório
- [ ] Configurar rate limiting
- [ ] Adicionar Sentry ou similar para error tracking
- [ ] Configurar backups automáticos do banco
- [ ] Testar em diferentes navegadores
- [ ] Revisar todas as variáveis de ambiente
- [ ] Adicionar logs estruturados

---

## 🎓 Recursos de Aprendizado

### Documentação Oficial
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

### Tutoriais Recomendados
- JWT Authentication em Next.js
- Upload de arquivos com Next.js
- Real-time features com WebSockets
- PostgreSQL optimization

---

## 📞 Precisa de Ajuda?

**Desenvolvido por:** [Sandro Servo](https://cloudservo.com.br)  
**Email:** contato@cloudservo.com.br

---

**Última atualização:** 20 de Novembro de 2025
