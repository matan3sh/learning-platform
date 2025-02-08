import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createSlugFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  return slug
}

export default function formatCurrency({
  amount,
  local = 'en-US',
  currency = 'USD',
  decimalPlaces = 2,
}: {
  amount: number
  local?: string
  currency?: string
  decimalPlaces?: number
}) {
  if (typeof amount !== 'number' || isNaN(amount)) return

  const { format } = new Intl.NumberFormat(local, {
    style: 'currency',
    currency,
    maximumFractionDigits: decimalPlaces,
  })

  return format(amount)
}

export function formatDuration(duration: number): string {
  const round = Math.floor(duration)

  const hours = Math.floor(round / 3600)
  const minutes = Math.floor((round % 3600) / 60)
  const seconds = round % 60

  return `${hours > 0 ? `${hours}:` : ''}${minutes < 10 && hours > 0 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
