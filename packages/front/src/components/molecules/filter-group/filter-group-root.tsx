// components/molecules/filter-group/filter-group-root.tsx
import { useId, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { FilterGroupContext } from './filter-group-context'

export interface FilterGroupRootProps {
  children: ReactNode
  className?: string
}

export function FilterGroupRoot({ children, className }: FilterGroupRootProps) {
  const groupId = useId()

  return (
    <FilterGroupContext.Provider value={{ groupId }}>
      <section
        className={cn(
          'flex flex-col bg-[var(--color-card-surface)] w-[var(--filter-group-width)]',
          className,
        )}
        aria-labelledby={`${groupId}-title`}
      >
        {children}
      </section>
    </FilterGroupContext.Provider>
  )
}
