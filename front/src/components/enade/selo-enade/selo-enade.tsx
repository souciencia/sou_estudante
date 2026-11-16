import { ConceitoEnade } from '@/components/enade/formas-enade/conceito-enade'
import { cn } from '@/utils/cn'

export interface SeloEnadeProps {
  level: 1 | 2 | 3 | 4 | 5 | 'SC' | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: {
    container: 'h-8 w-8 rounded-control',
    numeric: 'text-base',
    nonNumeric: 'text-xs',
  },
  md: {
    container: 'h-10 w-10 rounded-control',
    numeric: 'text-xl',
    nonNumeric: 'text-sm',
  },
  lg: {
    container: 'h-20 w-20 rounded-card',
    numeric: 'text-4xl',
    nonNumeric: 'text-xl',
  },
} as const

export function SeloEnade({ level, size = 'md' }: SeloEnadeProps) {
  const isNumeric = typeof level === 'number'
  const text = isNumeric ? String(level) : level === 'SC' ? 'SC' : '—'
  const label = isNumeric
    ? `Conceito Enade ${level} de 5`
    : level === 'SC'
      ? 'Sem conceito (SC)'
      : 'Sem avaliação no ciclo'
  const sizeClasses = SIZE_CLASSES[size]
  const fontClasses = isNumeric ? sizeClasses.numeric : sizeClasses.nonNumeric

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        'relative flex shrink-0 flex-col items-center justify-center overflow-hidden',
        sizeClasses.container,
      )}
    >
      <ConceitoEnade
        level={level}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        className={cn(
          'relative z-[1] font-selo font-normal leading-none text-stroke-selo',
          fontClasses,
        )}
      >
        {text}
      </div>
    </div>
  )
}
