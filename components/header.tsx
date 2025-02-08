import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-background/75 py-4 backdrop-blur-sm">
      <nav className="container flex items-center justify-between">
        <ul className="flex items-center gap-10 text-sm font-medium">
          <li className="font-serif text-lg font-semibold">
            <Link href="/">Learnn.dev</Link>
          </li>
          <li>
            <Link href="/courses">Courses</Link>
          </li>
          <SignedIn>
            <li>
              <Link href="/learn">My learning</Link>
            </li>
          </SignedIn>
        </ul>

        <div className="flex items-center justify-between gap-6">
          <ThemeToggle />

          <Button size="sm" variant="secondary" asChild>
            <Link href="/teach/courses">Teach</Link>
          </Button>

          <SignedOut>
            <SignInButton>
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}
