import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function logout() {
  'use server'
  cookies().set('session', '', { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 0 })
  redirect('/login')
}

export default async function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel do Professor</h1>
        <form action={logout}>
          <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">
            Sair
          </button>
        </form>
      </div>
      <div className="space-y-2">
        <Link href="/apresentacao/nova" className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Nova Apresentação</Link>
        <Link href="/aluno/demo" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded ml-2 hover:bg-indigo-700">Portal do Aluno (demo)</Link>
      </div>
    </div>
  )
}
