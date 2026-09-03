// components/molecules/filter-group/filter-group-context.ts
import { createContext, useContext } from 'react'

export interface FilterGroupContextValue {
  groupId: string
}

<<<<<<< HEAD
export const FilterGroupContext = createContext<FilterGroupContextValue | null>(
  null,
)
=======
export const FilterGroupContext = createContext<FilterGroupContextValue | null>(null)
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)

/**
 * Reads FilterGroup context, failing loudly if a sub-component is rendered
 * outside of FilterGroup.Root. Keeps dependencies explicit and traceable.
 */
<<<<<<< HEAD
export function useFilterGroupContext(
  subComponentDisplayName: string,
): FilterGroupContextValue {
=======
export function useFilterGroupContext(subComponentDisplayName: string): FilterGroupContextValue {
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
  const context = useContext(FilterGroupContext)
  if (context === null) {
    throw new Error(
      `${subComponentDisplayName} must be rendered inside <FilterGroup.Root>.`,
    )
  }
  return context
}
