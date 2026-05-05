import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DOJOIA - Forma Campeones para el Futuro',
    template: '%s | DOJOIA',
  },
  description: 'Plataforma educativa premium que combina karate, inglés, matemáticas, programación y más con inteligencia artificial. Formando campeones en mente, cuerpo y conocimiento.',
  keywords: ['educación', 'karate', 'inglés', 'matemáticas', 'programación', 'IA', 'niños', 'DOJOIA'],
  authors: [{ name: 'DOJOIA Team' }],
  creator: 'DOJOIA',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'DOJOIA - Forma Campeones para el Futuro',
    description: 'Plataforma educativa inspirada en el modelo Kumon, evolucionada con IA, gamificación y tecnología.',
    siteName: 'DOJOIA',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DOJOIA - Educación del Futuro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOJOIA - Forma Campeones para el Futuro',
    description: 'Plataforma educativa premium con IA, gamificación y tecnología.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
