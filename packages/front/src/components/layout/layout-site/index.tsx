import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/footer/footer'
import { ShellHeader } from '@/components/layout/header'
import { cn } from '@/utils/cn'

interface LayoutSiteProps {
  children: ReactNode
  className?: string
}

export const LayoutSite = ({ children, className }: LayoutSiteProps) => {
  return (
    <div
      className={cn('flex min-h-screen flex-col bg-site-background', className)}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-card-surface focus:px-4 focus:py-2 focus:font-coadjuvant focus:text-coadjuvant focus:font-semibold focus:text-accent-deep focus:outline-2 focus:outline-offset-2 focus:outline-accent-deep"
      >
        Pular para o conteúdo
      </a>

      <ShellHeader />

      <main id="conteudo" className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
