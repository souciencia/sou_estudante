import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface ProfileSectionProps {
  title: string
  children: ReactNode
  className?: string
}

/**
 * Bloco de conteúdo do Profile com um título de seção (ex.: "Continue sua rota").
 */
export function ProfileSection({
  title,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <h2 className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-fg-muted">
        {title}
      </h2>
      {children}
    </section>
  )
}
