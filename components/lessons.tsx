'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Course, Lesson, Tag, User } from '@prisma/client'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { CircleMinus, Pencil, Trash2 } from 'lucide-react'

import NewLessonForm from '@/components/new-lesson-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { deleteLessonAction } from '@/lib/actions'

interface LessonsProps {
  course: Course & {
    lessons: Lesson[]
    teacher: User
    tag: Tag
  }
}

export default function Lessons({ course }: LessonsProps) {
  const [addingLesson, setAddingLesson] = useState(false)

  function toggleForm() {
    setAddingLesson((c) => !c)
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-muted pb-5">
        <h3 className="text-xl font-semibold">Lessons</h3>

        <Button
          size="sm"
          className="h-7 gap-1"
          variant="outline"
          onClick={toggleForm}
        >
          {addingLesson ? (
            <CircleMinus className="h-3.5 w-3.5" />
          ) : (
            <PlusCircledIcon className="h-3.5 w-3.5" />
          )}
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {addingLesson ? 'Cancel' : 'Add new lesson'}
          </span>
        </Button>
      </div>

      {addingLesson && (
        <NewLessonForm toggleForm={toggleForm} courseSlug={course.slug} />
      )}

      {course.lessons?.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Add your first lesson to get started.
        </p>
      )}

      <ul role="list" className="mt-1 divide-y divide-muted">
        {course.lessons?.map((lesson) => (
          <li
            key={lesson.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-x-3">
                <p className="text-sm font-semibold leading-6 text-foreground">
                  {lesson.name}
                </p>
                <Badge
                  variant={lesson.isPublished ? 'destructive' : 'secondary'}
                >
                  {lesson.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center gap-x-2 text-xs leading-5 text-muted-foreground">
                <p className="whitespace-nowrap">
                  Added{' '}
                  <time dateTime={lesson.createdAt.toDateString()}>
                    {lesson.createdAt.toDateString()}
                  </time>
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-1">
              <Button size="icon" variant="ghost" asChild>
                <Link
                  href={`/teach/courses/${course.slug}/lessons/${lesson.slug}`}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => await deleteLessonAction(lesson.id)}
              >
                <Trash2 className="h-4 w-4 text-rose-500 dark:text-rose-400" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
