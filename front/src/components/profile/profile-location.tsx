'use client'

import type { ReactNode } from 'react'
import { IconTile } from '@/components/ui/icon-tile/icon-tile'
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
  variant?: boolean
  campus?: string
  region?: string
  className?: string
}

export function ProfileLocation({
  icon,
  eyebrow,
  value,
  source,
  tag,
  module,
  campus,
  region,
  className,
}: ProfileLocationProps) {
  const { module: contextModule } = useProfileContext('Profile.Location')
  const theme = module ?? contextModule

  return (
    <section
      data-module={theme}
      className={cn(
        'flex items-center justify-between gap-3 border-b-2',
        'rounded-panel bg-accent/[.06] p-[0.875rem] border-accent mx-4 mb-4',
        className,
      )}
    >
      <IconTile
        module={theme}
        className='h-[34px] w-[34px]'
      >
        {icon}
      </IconTile>

      <div className="flex flex-1 flex-col">
        <span className="font-sans text-2xs font-bold uppercase tracking-wide text-accent-deep">
          {eyebrow}
        </span>
        <span
          className={cn(
            'font-sans text-base font-bold leading-[1.1] tracking-[-0.2px] text-fg',
          )}
        >
          {value}
        </span>
        {campus && (
          <span className="font-sans text-xs uppercase text-accent-deep/80">
            {campus}
          </span>
        )}
        {source && (
          <span
            className={cn(
              'font-sans text-2xs text-fg-muted'
            )}
          >
            {source}
          </span>
        )}
      </div>

      {tag && region && (
        <div className="shrink-0 text-right">
          <span className="mb-[3px] inline-block rounded-full bg-accent-deep px-[9px] py-[2px] font-sans text-xs font-bold text-card-surface">
            {tag}
          </span>
          <p className="text-xs text-fg-muted">{region} · Brasil</p>
        </div>
      )}

      {tag && !region && (
        <span className="rounded-full bg-accent-deep px-[9px] py-[2px] font-sans text-xs font-bold text-card-surface text-on-dark">
          {tag}
        </span>
      )}
    </section>
  )
}
