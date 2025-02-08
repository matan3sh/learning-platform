import BackButton from '@/components/back-button'
import CoursePublishForm from '@/components/course-publish-form'
import Lessons from '@/components/lessons'
import { Badge } from '@/components/ui/badge'
import { getCourseBySlug } from '@/lib/entities/courses'
import { combineName } from '@/lib/entities/users'
import formatCurrency from '@/lib/utils'

export default async function TeacherCoursePage({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const course = await getCourseBySlug(slug, true)

  if (!course) {
    return (
      <section className="pb-24 pt-40">
        <div className="container">
          <h1 className="text-3xl font-bold">Course not found</h1>
          <p className="text-muted-foreground">
            The course you are looking for does not exist.
          </p>

          <div className="mt-8">
            <BackButton href="/courses" text="Back to courses" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div>
        <BackButton
          href="/teach/courses"
          text="Back"
          className="hidden md:inline-flex"
        />
      </div>

      <div className="mt-4 flex flex-col gap-x-10 gap-y-10 lg:flex-row">
        <div className="flex-1">
          <div className="flex items-center gap-x-3">
            <h3 className="text-xl font-semibold">{course.name}</h3>
            <Badge variant={course.isPublished ? 'destructive' : 'secondary'}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-xs font-light text-muted-foreground">
            By <span>{combineName(course.teacher)}</span>
          </p>

          <div className="mt-4 text-sm text-muted-foreground">
            {course.description}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <span className="-mt-1.5 font-serif text-2xl">
              {formatCurrency({ amount: course.price })}
            </span>

            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-xs font-light text-muted-foreground">
                Category
              </span>
              <Badge variant="secondary">{course.tag?.name}</Badge>
            </div>
          </div>

          <CoursePublishForm course={course} />
        </div>

        <div className="flex-1">
          <Lessons course={course} />
        </div>
      </div>
    </section>
  )
}
