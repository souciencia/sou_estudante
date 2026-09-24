'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useSearchHeaderContext } from './search-header-context'

export interface SearchHeaderSortingProps {
  children: ReactNode
  className?: string
}

/** Área de ordenação do header, separada por uma divisória. */
export function SearchHeaderSorting({
  children,
  className,
}: SearchHeaderSortingProps) {
  useSearchHeaderContext('SearchHeader.Sorting')
  return (
    <div className={cn('my-4 border-t border-gray-200 pt-4', className)}>
      {children}
    </div>
  )
}
