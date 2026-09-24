import { type ReactNode, useId } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { FilterGroupContext } from './filter-group-context'

export interface FilterGroupRootProps {
  children: ReactNode
  module?: Module
  className?: string
}

export function FilterGroupRoot({
  children,
  module,
  className,
}: FilterGroupRootProps) {
  const groupId = useId()

  return (
    <FilterGroupContext.Provider value={{ groupId }}>
      <section
        data-module={module}
        className={cn(
          'flex w-70 flex-col bg-card-surface font-coadjuvant text-fg-coadjuvant',
          className,
        )}
        aria-labelledby={`${groupId}-title`}
      >
        {children}
      </section>
    </FilterGroupContext.Provider>
  )
}
