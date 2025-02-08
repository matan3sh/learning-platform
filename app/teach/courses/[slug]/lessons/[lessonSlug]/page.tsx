import BackButton from '@/components/back-button'
import LessonContentForm from '@/components/lesson-content-form'
import { getLessonBySlug } from '@/lib/entities/lessons'

export default async function TeacherLessonPage({
  params,
}: {
  params: { slug: string; lessonSlug: string }
}) {
  const { slug: courseSlug, lessonSlug } = params
  const lesson = await getLessonBySlug(courseSlug, lessonSlug)

  if (!lesson) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Lesson not found</h1>
        <p className="text-muted-foreground">
          The lesson you are looking for does not exist.
        </p>

        <div className="mt-8">
          <BackButton
            href={`/teach/courses/${courseSlug}`}
            text="Back to course"
          />
        </div>
      </div>
    )
  }

  return (
    <section>
      <BackButton
        href={`/teach/courses/${courseSlug}`}
        text="Back"
        className="hidden md:inline-flex"
      />

      <div className="mt-4">
        <LessonContentForm lesson={lesson} />
      </div>
    </section>
  )
}
