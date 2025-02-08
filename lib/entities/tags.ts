import prisma from '@/lib/prisma'

export async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  return tags
}
