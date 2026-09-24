'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useSearchHeaderContext } from './search-header-context'

export interface SearchHeaderActionsProps {
  children: ReactNode
  className?: string
}

/** Faixa de controles extras do header (ex.: alternador de busca exata). */
export function SearchHeaderActions({
  children,
  className,
}: SearchHeaderActionsProps) {
  useSearchHeaderContext('SearchHeader.Actions')
  return (
    <div
      className={cn(
        'mt-3 flex flex-wrap items-center justify-between gap-2 px-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
