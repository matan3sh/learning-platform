'use server'

import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import Mux from '@mux/mux-node'
import { Course, User } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import { v4 as uuid } from 'uuid'
import { z } from 'zod'

import {
  NewCourseSchema,
  NewLessonSchema,
  TeacherProfileSchema,
} from '@/lib/schema'

const mux = new Mux()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

type NewCourseActionInputs = z.infer<typeof NewCourseSchema>
type NewLessonActionInputs = z.infer<typeof NewLessonSchema>

export async function createNewCourseAction(data: NewCourseActionInputs) {
  const { userId } = await auth()
  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const result = NewCourseSchema.safeParse(data)
  if (result.error) {
    return { error: 'Form validation error.' }
  }

  let course

  try {
    course = await prisma.course.create({
      data: {
        ...result.data,
        teacherId: userId,
      },
    })

    revalidatePath(`/teach/courses`)
  } catch (error: any) {
    if (error.meta?.modelName === 'Course' && error.code === 'P2002') {
      return {
        error: 'A course with that slug already exists.',
      }
    }
  }

  if (!course) {
    return { error: 'Failed to create the course.' }
  }

  redirect(`/teach/courses/${course.slug}`)
}

export async function updateCourseAction(
  courseId: string,
  data: Partial<Course>
) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      teacherId: userId,
    },
  })

  if (!course) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.course.update({
      where: { id: courseId },
      data,
    })

    revalidatePath(`/learn/courses`)
    revalidatePath(`/courses/${course.slug}`)
    revalidatePath(`/teach/courses/${course.slug}`)
  } catch {
    return { error: 'Failed to update the course.' }
  }
}

export async function deleteCourseAction(courseId: string) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      teacherId: userId,
    },
    include: {
      lessons: {
        include: {
          video: true,
        },
      },
      students: true,
    },
  })

  if (!course) {
    return { error: 'Unauthorized' }
  }

  // Check if the course has enrolled students
  if (course.students.length > 0) {
    return { error: 'Cannot delete a course with enrolled students.' }
  }

  try {
    for (const lesson of course.lessons) {
      if (lesson.video?.assetId) {
        await mux.video.assets.delete(lesson.video.assetId)
      }
    }

    await prisma.course.delete({
      where: { id: courseId },
    })

    revalidate('/courses')
    revalidatePath(`/teach/courses`)
    revalidatePath(`/learn/courses`)
  } catch {
    return { error: 'Failed to delete the course.' }
  }

  redirect('/teach/courses')
}

export async function createNewLessonAction(
  data: NewLessonActionInputs,
  courseSlug: string
) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const course = await prisma.course.findUnique({
    where: {
      slug: courseSlug,
      teacherId: userId,
    },
  })

  if (!course) {
    return { error: 'Unauthorized' }
  }

  const result = NewLessonSchema.safeParse(data)

  if (result.error) {
    return { error: 'Form validation error.' }
  }

  let lesson

  try {
    lesson = await prisma.lesson.create({
      data: {
        ...result.data,
        courseSlug,
      },
    })

    revalidatePath(`/teach/courses/${courseSlug}`)
  } catch (error: any) {
    if (error.meta?.modelName === 'Lesson' && error.code === 'P2002') {
      return {
        error: 'A lesson with that slug already exists.',
      }
    }
  }

  if (!lesson) {
    return { error: 'Failed to create the lesson.' }
  }
}

export async function updateLessonAction(lessonId: string, data: any) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      course: {
        teacherId: userId,
      },
    },
    include: {
      course: true,
    },
  })

  if (!lesson) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.lesson.update({
      where: { id: lessonId },
      data,
    })

    // Unpublish the course if it has no published lessons
    const lessons = await prisma.lesson.count({
      where: {
        courseSlug: lesson.courseSlug,
        isPublished: true,
      },
    })

    if (lessons === 0) {
      await prisma.course.update({
        where: { slug: lesson.courseSlug },
        data: {
          isPublished: false,
        },
      })
    }

    revalidatePath(
      `/teach/courses/${lesson.course.slug}/lessons/${lesson.slug}`
    )
    revalidatePath(
      `/learn/courses/${lesson.course.slug}/lessons/${lesson.slug}`
    )
  } catch {
    return { error: 'Failed to update the lesson.' }
  }
}

export async function deleteLessonAction(
  lessonId: string,
  redirectTo?: string
) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      course: {
        teacherId: userId,
      },
    },
    include: {
      course: true,
      video: true,
    },
  })

  if (!lesson) {
    return { error: 'Unauthorized' }
  }

  try {
    // Delete the lesson
    await prisma.lesson.delete({
      where: { id: lessonId },
    })

    // Delete the video asset in mux
    if (lesson.video?.assetId) {
      await mux.video.assets.delete(lesson.video.assetId)
    }

    // Unpublish the course if it has no lessons
    const lessons = await prisma.lesson.count({
      where: {
        courseSlug: lesson.courseSlug,
        isPublished: true,
      },
    })

    if (lessons === 0) {
      await prisma.course.update({
        where: { slug: lesson.courseSlug },
        data: {
          isPublished: false,
        },
      })
    }

    revalidatePath(`/teach/courses/${lesson.course.slug}`)
    revalidatePath(`/learn/courses/${lesson.course.slug}`)
  } catch {
    return { error: 'Failed to delete the lesson.' }
  }

  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function createUploadUrl(lessonId: string) {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      course: {
        teacherId: userId,
      },
    },
    include: {
      video: true,
    },
  })

  if (!lesson) redirect('/sign-in')

  // Delete the previous video asset in mux
  if (lesson.video?.assetId) {
    await mux.video.assets.delete(lesson.video.assetId)
  }

  const passthrough = uuid()
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ['public'],
      encoding_tier: 'baseline',
      passthrough,
    },
    // TODO: Change this origin to your-domain.com
    cors_origin: '*',
  })

  // Update existing or create a new record in the database
  await prisma.video.upsert({
    where: {
      lessonId: lessonId,
    },
    update: {
      status: 'waiting',
      passthrough: passthrough,
      uploadId: upload.id,
      assetId: null,
      playbackId: null,
      duration: null,
      aspectRatio: null,
    },
    create: {
      status: 'waiting',
      passthrough: passthrough,
      uploadId: upload.id,
      teacherId: userId,
      lessonId: lessonId,
    },
  })

  return upload.url
}

export async function revalidate(path: string) {
  return revalidatePath(path)
}

export async function updateTeacherProfileAction(
  teacherId: string,
  data: Partial<User>
) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  if (userId !== teacherId) {
    return { error: 'Unauthorized' }
  }

  const result = TeacherProfileSchema.safeParse(data)

  if (result.error) {
    return { error: 'Form validation error.' }
  }

  try {
    await prisma.user.update({
      where: { clerkUserId: teacherId },
      data: result.data,
    })

    revalidatePath(`/teach/profile`)
  } catch {
    return { error: 'Failed to update the profile.' }
  }
}

export async function createStripeCheckoutSession(courseId: string) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Sign in to purchase the course.' }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId, isPublished: true },
  })

  if (!course) {
    return { error: 'Course not found or not published.' }
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      learningCourses: true,
    },
  })

  if (!user) {
    return { error: 'User not found.' }
  }

  if (user?.learningCourses.find((c) => c.id === courseId)) {
    return { error: 'Already enrolled in the course.' }
  }

  const requestHeaders = headers()
  const origin = requestHeaders.get('origin')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    ...(user.stripeCustomerId
      ? { customer: user.stripeCustomerId }
      : { customer_email: user.email }),
    allow_promotion_codes: true,
    invoice_creation: { enabled: true },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'USD',
          product_data: {
            name: course.name,
            description: course.description!,
          },
          unit_amount: course.price * 100,
        },
      },
    ],
    success_url: `${origin}/courses/${course.slug}/checkout?sessionId={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/courses/${course.slug}`,
    metadata: {
      courseId: course.id,
      userId,
    },
  })

  return { sessionId: session.id }
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  try {
    if (!sessionId) {
      return { error: 'Missing Stripe checkout session ID.' }
    }

    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return { error: 'Unauthorized' }
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items.data.price.product'],
    })

    if (!session) {
      return { error: 'Failed to retrieve the checkout session.' }
    }

    const courseId = session.metadata?.courseId
    const userId = session.metadata?.userId

    if (!courseId || !userId) {
      return { error: 'Invalid checkout session.' }
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!course) {
      return { error: 'Course not found.' }
    }

    const firstLessonSlug = course.lessons?.[0]?.slug

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        learningCourses: true,
      },
    })

    if (!user) {
      return { error: 'User not found.' }
    }

    if (user?.learningCourses.find((c) => c.id === courseId)) {
      return { session, firstLessonSlug }
    }

    await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        stripeCustomerId: session.customer as string,
        learningCourses: {
          connect: { id: courseId },
        },
      },
    })

    // TODO: send a confirmation email to the user
    // TODO: optionally you can update clerk user metadata

    revalidatePath(`/courses/${course.slug}`)

    return { session, firstLessonSlug }
  } catch (error) {
    return { error: 'Failed to retrieve the checkout session.' }
  }
}

// For development purposes only
export async function refundCourseAction(courseId: string) {
  const { userId } = await auth()

  if (!userId) {
    return { error: 'Unauthorized' }
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })

  if (!course) {
    return { error: 'Course not found.' }
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      learningCourses: true,
    },
  })

  if (!user?.learningCourses.find((c) => c.id === courseId)) {
    return { error: 'Not enrolled in the course.' }
  }

  // remove the course from the user's learning courses
  const updatedUser = await prisma.user.update({
    where: { clerkUserId: userId },
    data: {
      learningCourses: {
        disconnect: { id: courseId },
      },
    },
  })

  revalidatePath(`/courses/${course.slug}`)

  return { updatedUser }
}

export async function getUserAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        learningCourses: true,
      },
    })

    if (!user) {
      return { error: 'User not found.' }
    }

    return { user }
  } catch (error) {
    return { error: 'Failed to get the user.' }
  }
}
