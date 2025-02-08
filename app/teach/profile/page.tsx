import TeacherProfileForm from '@/components/teacher-profile-form'
import { getUserById } from '@/lib/entities/users'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/')
  }

  const { user: teacher } = await getUserById({ clerkUserId: userId })
  if (!teacher) {
    return null
  }

  return (
    <section>
      <div>
        <h3 className="text-xl font-bold">Teacher profile</h3>

        <TeacherProfileForm teacher={teacher} />
      </div>
    </section>
  )
}
