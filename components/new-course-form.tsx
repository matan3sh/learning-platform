'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Tag } from '@prisma/client'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'

import { createNewCourseAction } from '@/lib/actions'
import { NewCourseSchema } from '@/lib/schema'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSlugFromName } from '@/lib/utils'

type Inputs = z.infer<typeof NewCourseSchema>

export default function NewCourseForm({ tags }: { tags: Tag[] }) {
  const {
    watch,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(NewCourseSchema),
  })

  const name = watch('name')
  register('tagId')

  useEffect(() => {
    if (name) {
      const slug = createSlugFromName(name)

      if (slug) {
        setValue('slug', slug, { shouldValidate: true })
      }
    }
  }, [name])

  const processForm: SubmitHandler<Inputs> = async (data) => {
    const result = await createNewCourseAction(data)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    toast.success('Course created!')
  }

  return (
    <div className="max-w-lg">
      <h3 className="text-xl font-bold">Add new course</h3>
      <form className="mt-6" onSubmit={handleSubmit(processForm)}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Course name"
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
                placeholder="Course slug"
                {...register('slug')}
              />
              {errors.slug?.message && (
                <p className="mt-1 px-2 text-xs text-red-400">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Textarea
              rows={5}
              placeholder="Course description"
              {...register('description')}
            />
            {errors.description?.message && (
              <p className="mt-1 px-2 text-xs text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Course price"
                {...register('price')}
              />
              {errors.price?.message && (
                <p className="mt-1 px-2 text-xs text-red-400">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Select
                onValueChange={(value) =>
                  setValue('tagId', value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tags</SelectLabel>

                    {tags && tags.length > 0 ? (
                      tags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tags">No tags found</SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {errors.tagId?.message && (
                <p className="mt-1 px-2 text-xs text-red-400">
                  {errors.tagId.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="">
            Create
          </Button>
        </div>
      </form>
    </div>
  )
}
