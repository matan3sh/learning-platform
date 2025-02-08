import prisma from '@/lib/prisma'

export async function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const lesson = await prisma.lesson.findUnique({
    where: {
      courseSlug_slug: {
        courseSlug,
        slug: lessonSlug,
      },
    },
    include: {
      video: true,
    },
  })

  return lesson
}
