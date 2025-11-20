import Link from 'next/link'

async function logout() {
  'use server'
  await fetch('http://localhost:3000/api/auth/logout', { method: 'POST' })
}

export default async function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Painel do Professor</h1>
      <div className="space-y-2">
        <Link href="/apresentacao/nova" className="inline-block bg-green-600 text-white px-4 py-2 rounded">Nova Apresentação</Link>
        <Link href="/aluno/demo" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded ml-2">Portal do Aluno (demo)</Link>
        <form action={logout} className="inline-block ml-2">
          <button className="bg-gray-700 text-white px-4 py-2 rounded">Sair</button>
        </form>
      </div>
    </div>
  )
}
