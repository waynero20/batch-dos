import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
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
      <body className={`${inter.variable} ${instrument.variable}`}>{children}</body>
    </html>
  )
}
