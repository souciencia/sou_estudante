import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface SearchHeaderRootProps {
  children: ReactNode
  module?: Module
  className?: string
}

export function SearchHeaderRoot({
  children,
  module,
  className,
}: SearchHeaderRootProps) {
  return (
    <div data-module={module} className={cn('font-sans text-fg', className)}>
      {children}
    </div>
  )
}
