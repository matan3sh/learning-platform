import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import localFont from 'next/font/local'

import Footer from '@/components/footer'
import Header from '@/components/header'
import Providers from '@/components/providers'

import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Learnn.dev',
  description: 'The ultimate learning platform for developers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" suppressHydrationWarning>
        <body
          className={cn(
            'flex min-h-screen flex-col',
            geistSans.variable,
            geistMono.variable,
            inter.variable,
            playfair.variable
          )}
        >
          <Providers>
            <Header />
            <main className="grow">{children}</main>
            <Footer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
