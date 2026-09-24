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
    <ul className={cn('m-0 flex list-none flex-col gap-[22px] p-0', className)}>
      {children}
    </ul>
  )
}
