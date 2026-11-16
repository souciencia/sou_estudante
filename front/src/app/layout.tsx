import type { Metadata } from 'next'
import { DM_Mono } from 'next/font/google'
import { WavesShape } from '@/assets/waves'
import { Footer } from '@/components/layout/footer/footer'
import { LayoutSite } from '@/components/layout/layout-site'
import { cn } from '@/utils/cn'
import { Providers } from './providers'
import './globals.css'

const dmMono = DM_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
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
        className={cn(
          'relative antialiased bg-linear-15 from-surface-lv0 to-surface-lv0-top',
          dmMono.variable,
        )}
      >
        <Providers>
          <LayoutSite className="z-10">{children}</LayoutSite>
          <Footer className="z-10" />
          <WavesShape className="fixed bottom-0 -z-10" />
        </Providers>
      </body>
    </html>
  )
}
