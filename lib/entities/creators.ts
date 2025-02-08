import prisma from '@/lib/prisma'

export async function getCreatorById(id: string) {
  const creator = await prisma.user.findUnique({
    where: {
      clerkUserId: id,
    },
  })

  return creator
}

export async function getTopCreators() {
  const topCreators = await prisma.user.findMany({
    where: {
      teachingCourses: {
        some: {
          isPublished: true,
        },
      },
    },
    orderBy: {
      teachingCourses: {
        _count: 'desc',
      },
    },
    take: 5,
  })

  return topCreators
}
