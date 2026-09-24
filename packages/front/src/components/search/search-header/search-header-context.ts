import { createContext, useContext } from 'react'
import type { Module } from '@/lib/module'

export interface SearchHeaderContextValue {
  module?: Module
}

export const SearchHeaderContext =
  createContext<SearchHeaderContextValue | null>(null)

/**
 * Lê o contexto do `SearchHeader`, lançando erro claro quando um subcomponente
 * é usado fora do componente pai.
 */
export function useSearchHeaderContext(
  subComponent: string,
): SearchHeaderContextValue {
  const context = useContext(SearchHeaderContext)
  if (context === null) {
    throw new Error(`${subComponent} must be rendered inside <SearchHeader>.`)
  }
  return context
}
