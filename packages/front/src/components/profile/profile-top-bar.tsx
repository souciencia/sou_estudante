'use client'

import type { ReactNode } from 'react'
import { BackLink } from '@/components/ui/back-link/back-link'
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
    <header className={cn('flex items-center justify-between p-4 pb-0', className)}>
      <BackLink label={backLabel} fallbackHref={backHref} />
      {children}
    </header>
  )
}
