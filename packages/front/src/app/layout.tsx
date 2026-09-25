import type { Metadata } from 'next'
import { Source_Sans_3, DM_Mono, Playfair_Display } from 'next/font/google'
import { Header } from '@/components/layout/header/header'
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
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-card-surface focus:px-4 focus:py-2 focus:font-coadjuvant focus:text-coadjuvant focus:font-semibold focus:text-accent-deep focus:outline-2 focus:outline-offset-2 focus:outline-accent-deep"
        >
          Pular para o conteúdo
        </a>
        <Header />
        <div id="conteudo">{children}</div>
      </body>
    </html>
  )
}
