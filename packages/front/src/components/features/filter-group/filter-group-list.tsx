import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupListProps {
  children: ReactNode
  className?: string
}

export function FilterGroupList({ children, className }: FilterGroupListProps) {
  useFilterGroupContext('FilterGroup.List')

  return (
    <ul
      className={cn(
        'm-0 flex list-none flex-col gap-[var(--filter-group-list-gap)] p-0',
        className,
      )}
    >
      {children}
    </ul>
  )
}
