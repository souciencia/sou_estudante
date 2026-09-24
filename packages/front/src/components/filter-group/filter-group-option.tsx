import type { ChangeEvent } from 'react'
import { Checkbox } from '@/components/checkbox/checkbox'
import { Typo } from '@/components/typo'
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
        className="group flex cursor-pointer items-center gap-4"
      >
        <Checkbox
          id={optionInputId}
          value={value ?? label}
          checked={checked}
          defaultChecked={checked !== undefined ? undefined : defaultChecked}
          disabled={disabled}
          readOnly={!onChange && checked !== undefined}
          onChange={onChange}
          className="group-hover:border-fg-muted"
        />
        <Typo s="sm">{label}</Typo>
      </label>
      {hasResultCount && (
        <Typo s="xs" className="tabular-nums text-fg-muted">
          {resultCount}
        </Typo>
      )}
    </li>
  )
}
