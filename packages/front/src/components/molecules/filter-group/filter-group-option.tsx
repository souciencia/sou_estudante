// components/molecules/filter-group/filter-group-option.tsx
import type { ChangeEvent } from 'react'
import { Typo } from '@/components/atoms/typo'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupOptionProps {
  label: string
  value?: string
  resultCount?: number
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function FilterGroupOption({
  label,
  value,
  resultCount,
  checked,
  defaultChecked = false,
  disabled = false,
  className,
  onChange,
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
          value={value ?? label}
          className="filter-group__checkbox"
          checked={checked}
          defaultChecked={checked !== undefined ? undefined : defaultChecked}
          disabled={disabled}
          readOnly={!onChange && checked !== undefined}
          onChange={onChange}
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
