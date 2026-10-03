import { Signpost } from 'lucide-react'
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
    <section className={cn('flex flex-col gap-2 p-4', className)}>
      <div className="mb-2 flex items-center gap-[5px]">
        <Signpost className="size-3" aria-hidden="true" />
        <h2 className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-text-muted">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
