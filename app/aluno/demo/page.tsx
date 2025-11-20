import Link from 'next/link'

export default function DemoAluno() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Portal do Aluno (demo)</h1>
      <p>Após gravar uma aula, compartilhe o link com os alunos: <code>/aluno/[lessonId]</code>.</p>
      <Link className="text-blue-700 underline" href="/apresentacao/nova">Criar nova aula</Link>
    </div>
  )
}
