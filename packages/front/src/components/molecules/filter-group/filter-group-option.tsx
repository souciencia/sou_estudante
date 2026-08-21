// components/molecules/filter-group/filter-group-option.tsx
import { Typo } from '@/components/atoms/typo'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupOptionProps {
  label: string
  resultCount?: number
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
}

export function FilterGroupOption({
  label,
  resultCount,
  defaultChecked = false,
  disabled = false,
  className,
}: FilterGroupOptionProps) {
  const { groupId } = useFilterGroupContext('FilterGroup.Option')
  const optionInputId = `${groupId}-option-${label}`
  const hasResultCount = typeof resultCount === 'number'

  return (
    <li className={cn('flex items-center justify-between', className)}>
      <label
        htmlFor={optionInputId}
        className="filter-group__option-control flex cursor-pointer items-center gap-[var(--filter-group-control-gap)]"
      >
        <input
          id={optionInputId}
          type="checkbox"
          className="filter-group__checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          readOnly
        />
        <Typo s="md" className="text-[var(--filter-group-label-color)]">
          {label}
        </Typo>
      </label>
      {hasResultCount && (
        <Typo
          s="sm"
          className="text-[var(--filter-group-count-color)] tabular-nums"
        >
          {resultCount}
        </Typo>
      )}
    </li>
  )
}
