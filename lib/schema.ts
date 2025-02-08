import { z } from 'zod'

export const NewCourseSchema = z.object({
  name: z.string().min(3, 'Name is required.'),
  slug: z.string().min(3, 'Slug is required.'),
  description: z.string().min(3, 'Description is required.'),
  price: z.coerce.number().min(1, 'Price is required.'),
  tagId: z.string().min(3, 'Tag is required.'),
})

export const NewLessonSchema = z.object({
  name: z.string().min(3, 'Name is required.'),
  slug: z.string().min(3, 'Slug is required.'),
})

export const TeacherProfileSchema = z.object({
  bio: z.string(),
  linkedInUrl: z.string(),
  xUrl: z.string(),
  githubUrl: z.string(),
  website: z.string(),
})
