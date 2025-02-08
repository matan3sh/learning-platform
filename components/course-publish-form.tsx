'use client'

import { deleteCourseAction, updateCourseAction } from '@/lib/actions'
import { Course, Lesson } from '@prisma/client'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface CoursePublishFormProps {
  course: Course & { lessons?: Lesson[] | null }
}

export default function CoursePublishForm({ course }: CoursePublishFormProps) {
  const isPublished = course.isPublished
  const lessons = course.lessons

  async function togglePublish() {
    if (!lessons) {
      toast.error(
        'Please add at least one lesson before publishing the course.'
      )
      return
    }

    if (!lessons.some((lesson) => lesson.isPublished)) {
      toast.error(
        'Please publish at least one lesson before publishing the course.'
      )
      return
    }

    const result = await updateCourseAction(course.id, {
      isPublished: !isPublished,
    })

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Course updated successfully!')
  }

  async function handleDelete() {
    const result = await deleteCourseAction(course.id)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Course deleted successfully!')
  }

  return (
    <div className="mt-6 flex w-full gap-2">
      <Button
        size="sm"
        variant="destructive"
        className="flex-1 gap-2"
        onClick={handleDelete}
      >
        <Trash2 className="size-3.5 text-rose-500 dark:text-rose-400" />
        <span>Delete</span>
      </Button>

      <Button
        size="sm"
        className="flex-1"
        onClick={togglePublish}
        variant={isPublished ? 'secondary' : 'default'}
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
    </div>
  )
}
