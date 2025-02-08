import NavLink from '@/components/nav-links'
import { Button } from '@/components/ui/button'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

export default function TeachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="pb-24 pt-40">
      <div className="container">
        <main className="flex flex-col gap-4 md:gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Teach</h1>
            <Button size="sm" className="h-7 gap-1" asChild>
              <Link href="/teach/new">
                <PlusCircledIcon className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add new course
                </span>
              </Link>
            </Button>
          </div>

          <div className="grid w-full items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <nav
              className="grid gap-4 text-sm text-muted-foreground"
              x-chunk="dashboard-04-chunk-0"
            >
              <NavLink href="/teach/profile">Profile</NavLink>
              <NavLink href="/teach/courses">Courses</NavLink>
              <NavLink href="/teach/analytics">Analytics</NavLink>
            </nav>
            <div className="grid gap-6">{children}</div>
          </div>
        </main>
      </div>
    </section>
  )
}
