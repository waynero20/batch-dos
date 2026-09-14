import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, DM_Sans } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  // The link is shared once into a group chat. Without this it unfurls bare.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Batch DOS Reunion',
  description: 'Nine years later. Help the batch decide where we go.',
  openGraph: {
    title: "Asa na' ta? · Batch DOS Reunion",
    description: 'Nine years later. Five questions, about two minutes.',
    type: 'website',
    images: [{ url: '/cover.jpg', width: 1920, height: 1080, alt: "Asa na' ta? — nine years later" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Asa na' ta? · Batch DOS Reunion",
    description: 'Nine years later. Five questions, about two minutes.',
    images: ['/cover.jpg'],
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
      <body className={`${dmSans.variable} ${bricolage.variable}`}>{children}</body>
    </html>
  )
}
