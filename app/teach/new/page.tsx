import NewCourseForm from '@/components/new-course-form'
import { getTags } from '@/lib/entities/tags'

export default async function NewCoursePage() {
  const tags = await getTags()

  return <NewCourseForm tags={tags} />
}
