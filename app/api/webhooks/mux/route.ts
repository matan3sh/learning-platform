import prisma from '@/lib/prisma'
import Mux from '@mux/mux-node'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const mux = new Mux()

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.MUX_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error(
      'Please add MUX_WEBHOOK_SECRET from Mux Dashboard to .env or .env.local'
    )
  }

  const headerPayload = headers()
  const payload = await req.json()
  const body = JSON.stringify(payload)

  try {
    mux.webhooks.verifySignature(body, headerPayload, WEBHOOK_SECRET)
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  const { type, data } = payload

  switch (type) {
    case 'video.asset.created': {
      const video = await prisma.video.findUnique({
        where: {
          passthrough: data.passthrough,
        },
        include: {
          lesson: {
            include: {
              course: true,
            },
          },
        },
      })

      if (!video) {
        return new Response('Video not found!', { status: 400 })
      }

      if (video?.status !== 'ready') {
        await prisma.video.update({
          where: {
            id: video.id,
          },
          data: {
            status: data.status,
            assetId: data.id,
            playbackId: data.playback_ids[0].id,
          },
        })
      }

      const path = `/teach/courses/${video.lesson.course.slug}/lessons/${video.lesson.slug}`
      revalidatePath(path)

      break
    }
    case 'video.asset.ready': {
      const video = await prisma.video.findUnique({
        where: {
          passthrough: data.passthrough,
        },
        include: {
          lesson: {
            include: {
              course: true,
            },
          },
        },
      })

      if (!video) {
        return new Response('Video not found!', { status: 400 })
      }

      await prisma.video.update({
        where: {
          id: video.id,
        },
        data: {
          status: data.status,
          duration: data.duration,
          aspectRatio: data.aspect_ratio,
        },
      })

      const path = `/teach/courses/${video.lesson.course.slug}/lessons/${video.lesson.slug}`
      revalidatePath(path)

      break
    }
    case 'video.upload.cancelled': {
      const video = await prisma.video.findUnique({
        where: {
          passthrough: data.passthrough,
        },
      })

      if (!video) {
        return new Response('Video not found!', { status: 400 })
      }

      await prisma.video.update({
        where: {
          id: video.id,
        },
        data: {
          status: 'cancelled',
        },
      })
    }
    default:
      break
  }

  return new Response('', { status: 200 })
}
