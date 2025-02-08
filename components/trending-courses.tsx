import CourseItem from '@/components/course-item'
import { getCourses } from '@/lib/entities/courses'

export default async function TrendingCourses() {
  const courses = await getCourses(12)

  return (
    <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
      {courses.map((course) => (
        <CourseItem key={course.id} course={course} />
      ))}
    </ul>
  )
}
