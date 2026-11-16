import { createContext, useContext } from 'react'

export interface FilterGroupContextValue {
  groupId: string
}

export const FilterGroupContext = createContext<FilterGroupContextValue | null>(
  null,
)

/**
 * Reads FilterGroup context, failing loudly if a sub-component is rendered
 * outside of FilterGroup.Root. Keeps dependencies explicit and traceable.
 */
export function useFilterGroupContext(
  subComponentDisplayName: string,
): FilterGroupContextValue {
  const context = useContext(FilterGroupContext)
  if (context === null) {
    throw new Error(
      `${subComponentDisplayName} must be rendered inside <FilterGroup.Root>.`,
    )
  }
  return context
}
