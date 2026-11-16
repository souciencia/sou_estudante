import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupTitleProps {
  children: ReactNode
  className?: string
}

export function FilterGroupTitle({
  children,
  className,
}: FilterGroupTitleProps) {
  const { groupId } = useFilterGroupContext('FilterGroup.Title')

  return (
    <h4
      id={`${groupId}-title`}
      className={cn('mb-5 font-display font-semibold text-fg-muted', className)}
    >
      {children}
    </h4>
  )
}
