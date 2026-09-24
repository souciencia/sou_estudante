'use client'

import type { ReactNode } from 'react'
import { BackLink } from '@/components/atoms/back-link'
import { cn } from '@/utils/cn'

export interface ProfileTopBarProps {
  backLabel: string
  backHref?: string
  children?: ReactNode
  className?: string
}

export function ProfileTopBar({
  backLabel,
  backHref,
  children,
  className,
}: ProfileTopBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <BackLink label={backLabel} fallbackHref={backHref} />
      {children}
    </div>
  )
}
