import { ConceitoEnade } from '@/components/enade/formas-enade/conceito-enade'
import { cn } from '@/utils/cn'

export interface SeloEnadeProps {
  level: 1 | 2 | 3 | 4 | 5 | 'SC' | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: {
    container: 'size-8 rounded-control',
    numeric: 'text-base',
    nonNumeric: 'text-xs',
    enade: null,
  },
  md: {
    container: 'size-12 rounded-control',
    numeric: 'text-xl',
    nonNumeric: 'text-sm',
    enade: 'text-[9px]',
  },
  lg: {
    container: 'size-20 rounded-card',
    numeric: 'text-4xl',
    nonNumeric: 'text-xl',
    enade: 'text-[12px]',
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

      {sizeClasses.enade && (
        <span
          className={cn(
            'font-selo font-normal leading-none text-on-dark',
            'absolute bottom-0',
            sizeClasses.enade,
          )}
        >
          Enade
        </span>
      )}

      <div className="absolute top-0 left-0 w-full h-full bg-on-dark/30"></div>
    </div>
  )
}
