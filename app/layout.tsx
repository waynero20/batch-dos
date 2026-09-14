import type { Metadata, Viewport } from 'next'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Asa na' ta? · Batch DOS Reunion",
  description:
    'Pilia ang petsa, lugar, pagkaon ug kolor para sa atong reunion. Nine years later — help the batch decide.',
  openGraph: {
    title: "Asa na' ta? · Batch DOS Reunion",
    description: 'Nine years later. Help the batch decide where we go.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#EFF8FF',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ceb">
      <body className={`${archivo.variable} ${inter.variable}`}>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}
