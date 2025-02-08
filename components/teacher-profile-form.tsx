'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import { updateTeacherProfileAction } from '@/lib/actions'
import { TeacherProfileSchema } from '@/lib/schema'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import { User } from '@prisma/client'

type Inputs = z.infer<typeof TeacherProfileSchema>

export default function TeacherProfileForm({ teacher }: { teacher: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(TeacherProfileSchema),
    defaultValues: {
      bio: teacher.bio || '',
      linkedInUrl: teacher.linkedInUrl || '',
      xUrl: teacher.xUrl || '',
      githubUrl: teacher.githubUrl || '',
      website: teacher.website || '',
    },
  })

  const processForm: SubmitHandler<Inputs> = async (data) => {
    const isEmpty = Object.values(data).every((value) => value === '')
    if (isEmpty) {
      toast.error('Please fill in at least one field.')
      return
    }

    const result = await updateTeacherProfileAction(teacher.clerkUserId, data)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Profile updated successfully.')
  }

  return (
    <div className="max-w-lg">
      <form className="mt-6" onSubmit={handleSubmit(processForm)}>
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <Textarea
              rows={5}
              placeholder="Write about who you are..."
              {...register('bio')}
            />
            {errors.bio?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.bio.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="LinkedIn"
              {...register('linkedInUrl')}
            />
            {errors.linkedInUrl?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.linkedInUrl.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input type="text" placeholder="Twitter" {...register('xUrl')} />
            {errors.xUrl?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.xUrl.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Github"
              {...register('githubUrl')}
            />
            {errors.githubUrl?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.githubUrl.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input type="text" placeholder="Website" {...register('website')} />
            {errors.website?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.website.message}
              </p>
            )}
          </div>

          <Button type="submit" className="">
            Update
          </Button>
        </div>
      </form>
    </div>
  )
}
