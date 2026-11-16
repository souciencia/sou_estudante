import type { ReactNode } from 'react'
import { ShellHeader } from '@/components/layout/header/shell-header'
import { cn } from '@/utils/cn'

interface LayoutSiteProps {
  children: ReactNode
  className?: string
}

export const LayoutSite = ({ children, className }: LayoutSiteProps) => {
  return (
    <div className={cn('flex min-h-screen flex-col', className)}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-surface-lv2 focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-semibold focus:text-accent-deep focus:outline-2 focus:outline-offset-2 focus:outline-accent-deep"
      >
        Pular para o conteúdo
      </a>

      <ShellHeader />

      <main id="conteudo" className="flex-1">
        {children}
      </main>
    </div>
  )
}
