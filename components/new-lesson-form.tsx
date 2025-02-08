'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createNewLessonAction } from '@/lib/actions'
import { NewLessonSchema } from '@/lib/schema'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createSlugFromName } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type Inputs = z.infer<typeof NewLessonSchema>

interface NewLessonFormProps {
  courseSlug: string
  toggleForm: () => void
}

export default function NewLessonForm({
  courseSlug,
  toggleForm,
}: NewLessonFormProps) {
  const {
    watch,
    reset,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(NewLessonSchema),
  })

  const name = watch('name')

  useEffect(() => {
    if (name) {
      const slug = createSlugFromName(name)

      if (slug) {
        setValue('slug', slug, { shouldValidate: true })
      }
    }
  }, [name])

  const processForm: SubmitHandler<Inputs> = async (data) => {
    const result = await createNewLessonAction(data, courseSlug)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    reset()
    toast.success('Lesson added successfully')
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Add new lesson</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(processForm)}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Lesson name"
                  {...register('name')}
                />
                {errors.name?.message && (
                  <p className="mt-1 px-2 text-xs text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Lesson slug"
                  {...register('slug')}
                />
                {errors.slug?.message && (
                  <p className="mt-1 px-2 text-xs text-red-400">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="sm"
                type="button"
                className="flex-1"
                variant="secondary"
                onClick={toggleForm}
              >
                Close
              </Button>
              <Button type="submit" size="sm" className="flex-1">
                Add lesson
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
