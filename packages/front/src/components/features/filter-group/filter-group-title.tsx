import type { ReactNode } from 'react'
import { Typo } from '@/components/atoms/typo'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

type FilterGroupTitleTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p'

export interface FilterGroupTitleProps {
  children: ReactNode
  t?: FilterGroupTitleTag
  className?: string
}

export function FilterGroupTitle({
  children,
  t = 'h3',
  className,
}: FilterGroupTitleProps) {
  const { groupId } = useFilterGroupContext('FilterGroup.Title')

  return (
    <Typo
      t={t}
      s="lg"
      id={`${groupId}-title`}
      className={cn(
        'mb-[var(--filter-group-title-gap)] font-bold text-[var(--filter-group-title-color)]',
        className,
      )}
    >
      {children}
    </Typo>
  )
}
