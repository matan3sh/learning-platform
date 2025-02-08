'use client'

import { useAuth } from '@clerk/nextjs'
import { Pencil } from 'lucide-react'
import Link from 'next/link'

import { Course, Lesson, Tag, User } from '@prisma/client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { combineName } from '@/lib/entities/users'
import formatCurrency from '@/lib/utils'

interface CourseItemProps {
  course: Course & {
    lessons?: Lesson[]
    teacher?: User
    tag?: Tag
  }
  teacherView?: boolean
}

export default function CourseItem({ course, teacherView }: CourseItemProps) {
  const { userId } = useAuth()
  const isTeacher = course.teacherId === userId

  return (
    <li key={course.id} className="relative">
      <Link href={`/courses/${course.slug}`}>
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{course.name}</div>
                <p className="text-xs font-light text-muted-foreground">
                  By <span>{combineName(course.teacher as User)}</span>
                </p>
              </div>
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-4 max-w-md text-sm text-muted-foreground">
              {course.description}
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <div className="mt-3 flex w-full items-center justify-between gap-2">
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
          </CardFooter>
        </Card>
      </Link>

      {isTeacher && (
        <Button size="icon" variant="ghost" asChild>
          <Link
            href={`/teach/courses/${course.slug}`}
            className="absolute right-3 top-3"
          >
            <Pencil className="h-5 w-5 text-muted-foreground" />
          </Link>
        </Button>
      )}
    </li>
  )
}
