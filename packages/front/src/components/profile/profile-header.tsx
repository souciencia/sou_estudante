'use client'

import { Asterisk } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useProfileContext } from './profile-context'
import IconModule from '../ui/icon-module/iconModule'

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
    <section
      data-module={module}
      className={cn('p-4 pb-3', className)}
    >
      <span className="mb-[6px] flex items-center gap-[6px] text-coadjuvant-xs font-bold uppercase tracking-[0.7px] text-accent-deep">
        <IconModule module={module ?? '1'} />
        {badge}
      </span>

      <div className="flex items-start justify-between gap-4">
        <h1 className="mb-1 font-display text-xl font-bold leading-tight tracking-[-0.2px] text-text">
          {title}
        </h1>
        {aside}
      </div>

      {subtitle && (
        <p className="mb-2 text-coadjuvant text-text-muted">
          {subtitle}
        </p>
      )}

      {children && <>{children}</>}
    </section>
  )
}
