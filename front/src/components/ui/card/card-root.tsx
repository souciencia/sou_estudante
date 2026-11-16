import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface Props {
  v?: 'prev' | 'full'
  module?: Module
  children: ReactNode
  className?: string
}

export const CardRoot = ({
  children,
  className,
  module,
  v = 'prev',
}: Props) => {
  const variants = {
    prev: 'w-full',
    full: 'bg-gradient-to-r from-accent/40 to-accent/10',
  }

  return (
    <div
      data-module={module}
      className={cn(
        'bg-surface-lv2 border border-border-primary font-sans rounded-card text-fg shadow',
        'relative isolate overflow-hidden',
        'px-6 py-4',
        variants[v],
        className,
      )}
    >
      {children}
    </div>
  )
}
