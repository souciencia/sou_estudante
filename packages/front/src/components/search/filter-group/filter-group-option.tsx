import { cn } from '@/utils/cn'
import { useFilterGroupContext } from './filter-group-context'

export interface FilterGroupOptionProps {
  label: string
  checked?: boolean
  disabled?: boolean
  className?: string
  onChange?: () => void
  /** `checkbox` para multi-seleção (padrão) ou `radio` para seleção única. */
  type?: 'checkbox' | 'radio'
}

export function FilterGroupOption({
  label,
  checked,
  disabled = false,
  className,
  onChange,
  type = 'checkbox',
}: FilterGroupOptionProps) {
  // `useFilterGroupContext` garante que a opção está dentro de `FilterGroup.Root`
  // e fornece o `groupId` usado como `name` dos radios para agrupá-los.
  const { groupId } = useFilterGroupContext('FilterGroup.Option')

  return (
    <li className={className}>
      <label
        className={cn(
          'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition duration-300',
          'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-deep',
          'font-sans text-xs font-semibold tracking-wide uppercase',
          checked
            ? 'bg-accent/70 border-accent/70 text-accent-fg'
            : 'bg-filter-option text-fg-muted border border-fg-muted/10',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <input
          type={type}
          name={type === 'radio' ? groupId : undefined}
          checked={checked}
          disabled={disabled}
          readOnly={checked !== undefined && !onChange}
          onChange={onChange}
          aria-label={label}
          className="sr-only"
        />
        <span aria-hidden="true">{label}</span>
      </label>
    </li>
  )
}
