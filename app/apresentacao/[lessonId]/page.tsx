import { prisma } from '@/lib/db'
import Presentation from '@/components/Presentation'

export default async function Page({ params }: { params: { lessonId: string } }) {
  const lesson = await prisma.lesson.findUnique({ where: { id: params.lessonId }, include: { slides: { orderBy: { order: 'asc' } } } })
  const slides = lesson?.slides || []
  return (
    <div className="h-screen">
      <Presentation lessonId={params.lessonId} slides={slides} />
    </div>
  )
}
