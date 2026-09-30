import type { Metadata } from 'next'
import { DM_Mono, Playfair_Display, Source_Sans_3 } from 'next/font/google'
import { LayoutSite } from '@/components/layout/layout-site'
import './globals.css'

const sourceSans = Source_Sans_3({
  variable: '--font-protagonist',
  subsets: ['latin'],
})

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'SoU_Estudante',
  description:
    'Plataforma de dados públicos do ensino superior para estudantes de primeira geração — SoU_Ciência (Unifesp).',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${sourceSans.variable} ${dmMono.variable} ${playfair.variable} antialiased`}
      >
        <LayoutSite>{children}</LayoutSite>
      </body>
    </html>
  )
}
