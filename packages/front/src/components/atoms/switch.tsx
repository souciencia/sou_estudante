import { cn } from '@/utils/cn'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
}: SwitchProps) {
  const isMedium = size === 'md'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        isMedium ? 'h-6 w-11' : 'h-5 w-9',
        checked ? 'bg-blue-600' : 'bg-gray-300',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block rounded-full bg-white shadow transition-transform duration-200',
          isMedium ? 'h-5 w-5' : 'h-4 w-4',
          checked && (isMedium ? 'translate-x-5' : 'translate-x-4'),
        )}
      />
    </button>
  )
}
