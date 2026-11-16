import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface SearchHeaderSortingProps {
  children: ReactNode
  className?: string
}

/** Área de ordenação do header, separada por uma divisória. */
export function SearchHeaderSorting({
  children,
  className,
}: SearchHeaderSortingProps) {
  return (
    <div className={cn('my-4 border-t border-border-primary pt-4', className)}>
      {children}
    </div>
  )
}
