'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Transição de entrada das páginas: fade + leve deslocamento vertical, aplicada
 * no próprio conteúdo. A `key` atrelada ao pathname remonta o wrapper (e reinicia
 * a animação) a cada navegação de rota — inclusive `/cursos` ↔ `/cursos/[id]` —
 * sem duplicar elementos. `?q=` não muda o pathname, então não reanima a busca.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <div key={pathname} className={cn('page-transition', className)}>
      {children}
    </div>
  )
}
