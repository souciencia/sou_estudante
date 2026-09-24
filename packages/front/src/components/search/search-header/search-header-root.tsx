'use client'

import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { SearchHeaderContext } from './search-header-context'

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
    <SearchHeaderContext.Provider value={{ module }}>
      <div
        data-module={module}
        className={cn(
          'rounded-md border p-2 font-coadjuvant text-fg-coadjuvant',
          className,
        )}
      >
        {children}
      </div>
    </SearchHeaderContext.Provider>
  )
}
