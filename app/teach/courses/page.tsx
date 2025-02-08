import Link from 'next/link'

import { auth } from '@clerk/nextjs/server'

import CourseItem from '@/components/course-item'
import { Button } from '@/components/ui/button'
import { getCoursesByTeacherId } from '@/lib/entities/courses'

export default async function Courses() {
  const { userId } = await auth()
  const courseList = await getCoursesByTeacherId(userId!)

  return (
    <>
      {courseList.length === 0 ? (
        <div>
          <h2 className="text-2xl font-bold">
            You haven't created any courses yet.
          </h2>
          <p className="text-muted-foreground">
            Click the button below to create your first course.
          </p>

          <Button variant="outline" className="mt-6" asChild>
            <Link href="/teach/new">
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create your first course ✨
              </span>
            </Link>
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
          {courseList.map((course) => (
            <CourseItem key={course.id} course={course} teacherView />
          ))}
        </ul>
      )}
    </>
  )
}
