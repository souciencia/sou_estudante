import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CardTitleLevel = 2 | 3 | 4 | 5 | 6

interface Props {
  className?: string
  title: ReactNode
  subtitle?: ReactNode
  /** Nível do heading do título; o subtítulo usa o nível seguinte (máx. 6). */
  level?: CardTitleLevel
}

/**
 * Bloco de título/subtítulo de um Card (agnóstico de domínio).
 * O subtítulo só é renderizado quando presente.
 */
export const CardTitle = ({ title, subtitle, className, level = 4 }: Props) => {
  const TitleTag = `h${level}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  const SubtitleTag = `h${Math.min(level + 1, 6)}` as
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'

  return (
    <div className={cn(className)}>
      <TitleTag className="font-display font-bold text-base">{title}</TitleTag>
      {subtitle && (
        <SubtitleTag className="font-sans text-fg-muted text-sm">
          {subtitle}
        </SubtitleTag>
      )}
    </div>
  )
}
