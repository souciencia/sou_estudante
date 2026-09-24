import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface IconTileProps {
  module?: Module
  children: ReactNode
  className?: string
}

export const IconTile = ({ module, children, className }: IconTileProps) => {
  return (
    <span
      data-module={module}
      aria-hidden="true"
      className={cn(
        'inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/20 text-accent-deep',
        className,
      )}
    >
      {children}
    </span>
  )
}
