// components/molecules/filter-group/filter-group-option.tsx
<<<<<<< HEAD
import type { ChangeEvent } from 'react'
=======
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
import { Typo } from '@/components/atoms/typo'
import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupOptionProps {
  label: string
<<<<<<< HEAD
  value?: string
  resultCount?: number
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
=======
  resultCount?: number
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
}

export function FilterGroupOption({
  label,
<<<<<<< HEAD
  value,
  resultCount,
  checked,
  defaultChecked = false,
  disabled = false,
  className,
  onChange,
=======
  resultCount,
  defaultChecked = false,
  disabled = false,
  className,
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
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
<<<<<<< HEAD
          value={value ?? label}
          className="filter-group__checkbox"
          checked={checked}
          defaultChecked={checked !== undefined ? undefined : defaultChecked}
          disabled={disabled}
          readOnly={!onChange && checked !== undefined}
          onChange={onChange}
=======
          className="filter-group__checkbox"
          defaultChecked={defaultChecked}
          disabled={disabled}
          readOnly
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
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
