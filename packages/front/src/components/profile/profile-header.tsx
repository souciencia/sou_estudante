'use client'

import { Asterisk } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useProfileContext } from './profile-context'

export interface ProfileHeaderProps {
  badge: string
  title: string
  subtitle?: string
  aside?: ReactNode
  children?: ReactNode
  className?: string
}

export function ProfileHeader({
  badge,
  title,
  subtitle,
  aside,
  children,
  className,
}: ProfileHeaderProps) {
  const { module } = useProfileContext('Profile.Header')

  return (
    <header
      data-module={module}
      className={cn('flex flex-col gap-1', className)}
    >
      <span className="inline-flex items-center gap-1 font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-accent-deep">
        <Asterisk className="size-4" aria-hidden="true" />
        {badge}
      </span>

      <div className="flex items-start justify-between gap-4">
        <h1 className="font-title-protagonist text-protagonist-xl font-bold leading-tight text-fg-protagonist">
          {title}
        </h1>
        {aside}
      </div>

      {subtitle && (
        <p className="font-protagonist text-protagonist-lg text-fg-muted">
          {subtitle}
        </p>
      )}

      {children && <div className="mt-1 flex flex-col gap-3">{children}</div>}
    </header>
  )
}
