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
        'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-accent/10 text-accent-deep',
        className,
      )}
    >
      {children}
    </span>
  )
}
