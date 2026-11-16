import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
  children: ReactNode
}

/**
 * Camada de fundo decorativa do Card (agnóstica de domínio): ocupa todo o
 * interior, fica atrás do conteúdo (`-z-10`) e é recortada pelos cantos do
 * card. Sempre `aria-hidden` e sem captura de ponteiro.
 */
export const CardBackdrop = ({ className, children }: Props) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-card',
        className,
      )}
    >
      {children}
    </div>
  )
}
