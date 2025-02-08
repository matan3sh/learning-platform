'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavLink({
  href,
  children,
  ...props
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      {...props}
      className={cn('text-primary', isActive && 'font-semibold')}
    >
      {children}
    </Link>
  )
}
