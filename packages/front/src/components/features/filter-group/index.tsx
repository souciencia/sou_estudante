// components/molecules/filter-group/index.tsx
import { FilterGroupList } from './filter-group-list'
import { FilterGroupOption } from './filter-group-option'
import { FilterGroupRoot } from './filter-group-root'
import { FilterGroupTitle } from './filter-group-title'

export const FilterGroup = Object.assign(FilterGroupRoot, {
  Title: FilterGroupTitle,
  List: FilterGroupList,
  Option: FilterGroupOption,
})

export type { FilterGroupListProps } from './filter-group-list'
export type { FilterGroupOptionProps } from './filter-group-option'
export type { FilterGroupRootProps } from './filter-group-root'
export type { FilterGroupTitleProps } from './filter-group-title'
