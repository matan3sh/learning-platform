import prisma from '@/lib/prisma'

export async function getCourses(limit?: number) {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      teacher: true,
      tag: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    ...(limit ? { take: limit } : {}),
  })
  return courses
}

export async function getCourseBySlug(slug: string, teacherView = false) {
  const course = await prisma.course.findUnique({
    where: {
      slug,
    },
    include: {
      teacher: true,
      lessons: {
        ...(teacherView ? {} : { where: { isPublished: true } }),
        include: {
          video: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      tag: true,
    },
  })

  return course
}

export async function getCoursesByTeacherId(teacherId: string) {
  const creatorCourses = prisma.course.findMany({
    where: {
      teacherId,
    },
    include: {
      teacher: true,
      tag: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return creatorCourses
}

export async function getStudentCourses(studentId: string) {
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: studentId,
    },
  })

  if (!user) {
    return []
  }

  const studentCourses = await prisma.course.findMany({
    where: {
      students: {
        some: {
          id: user.id,
        },
      },
    },
    include: {
      lessons: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      teacher: true,
      tag: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return studentCourses
}
