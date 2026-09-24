'use client'

import type { ReactNode } from 'react'
import { IconTile } from '@/components/atoms/icon-tile'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useProfileContext } from './profile-context'

export interface ProfileLocationProps {
  icon: ReactNode
  eyebrow: string
  value: string
  source?: string
  tag?: string
  /** Sobrescreve o acento herdado do Profile (ex.: banner de local usa ciano). */
  module?: Module
  className?: string
}

export function ProfileLocation({
  icon,
  eyebrow,
  value,
  source,
  tag,
  module,
  className,
}: ProfileLocationProps) {
  const { module: contextModule } = useProfileContext('Profile.Location')
  const theme = module ?? contextModule

  return (
    <section
      data-module={theme}
      className={cn(
        'flex items-center gap-4 rounded-2xl bg-accent/10 px-5 py-4',
        className,
      )}
    >
      <IconTile module={theme} className="size-14 rounded-2xl">
        {icon}
      </IconTile>

      <div className="flex flex-1 flex-col">
        <span className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-accent-deep">
          {eyebrow}
        </span>
        <span className="font-title-protagonist text-protagonist-lg font-bold text-fg-protagonist">
          {value}
        </span>
        {source && (
          <span className="font-coadjuvant text-coadjuvant-sm text-fg-muted">
            {source}
          </span>
        )}
      </div>

      {tag && (
        <span className="rounded-full bg-accent-deep px-3 py-1 font-coadjuvant text-coadjuvant font-bold text-card-surface">
          {tag}
        </span>
      )}
    </section>
  )
}
