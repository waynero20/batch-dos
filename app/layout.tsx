import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Batch DOS Reunion',
  description: 'Nine years later. Help the batch decide.',
  openGraph: {
    title: 'Batch DOS Reunion',
    description: 'Nine years later. Help the batch decide.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="reunion">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
