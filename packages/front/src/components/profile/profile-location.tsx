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
  variant = false,
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
        variant ? 'rounded-[14px] bg-[rgba(0,229,255,.06)] p-[0.875rem] border-accent' : 'border-[#B3E0F0] bg-[#F0F9FF] px-5 py-[0.875rem]',
        className,
      )}
    >

      <IconTile module={theme} className={variant ? 'h-[34px] w-[34px]' : undefined}>
        {icon}
      </IconTile>

      <div className="flex flex-1 flex-col">
        <span className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-accent-deep">
          {eyebrow}
        </span>
        <span className={cn('font-protagonist text-protagonist font-bold leading-[1.1] tracking-[-0.2px]', variant ? 'text-text' : 'text-accent-deep')}>
          {value}
        </span>
        {campus && (
          <span className="font-coadjuvant text-coadjuvant-xs uppercase text-accent-deep/80">
            {campus}
          </span>
        )}
        {source && (
          <span className={cn('font-coadjuvant text-coadjuvant-xs', variant ? 'text-text-muted' : 'text-accent-deep/60')}>
            {source}
          </span>
        )}
      </div>

      {tag && region && (
        <div className="shrink-0 text-right">
          <span className="mb-[3px] inline-block rounded-full bg-accent-deep px-[9px] py-[2px] font-coadjuvant text-xs font-bold text-card-surface">
            {tag}
          </span>
          <p className="text-coadjuvant-xs text-text-muted">
            {region} · Brasil
          </p>
        </div>
      )}

      {tag && !region && (
        <span className="rounded-full bg-accent-deep px-[9px] py-[2px] font-coadjuvant text-xs font-bold text-card-surface">
          {tag}
        </span>
      )}
    </section>
  )
}
