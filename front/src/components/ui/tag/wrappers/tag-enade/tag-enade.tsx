/**
 * Molécula TagEnade — versão em formato de tag (pílula) do conceito Enade.
 * Reaproveita a paleta do mar (marPalette) para colorir fundo/borda/texto
 * conforme a faixa, mantendo coerência com o SeloEnade. A informação
 * acessível vive no próprio texto ("Nota 4 no Enade").
 */
import { marPalette } from '@/components/enade/formas-enade/geometria-mar'
import { Tag } from '@/components/ui/tag/tag'
import type { EnadeLevel } from '@/lib/enade'

export interface TagEnadeProps {
  level: EnadeLevel
  className?: string
}

const enadeLabel = (level: EnadeLevel): string => {
  if (typeof level === 'number') return `Nota ${level} no Enade`
  if (level === 'SC') return 'Sem conceito no Enade'
  return 'Sem avaliação no Enade'
}

export function TagEnade({ level, className }: TagEnadeProps) {
  const numericLevel = typeof level === 'number' ? level : null
  const palette = marPalette(numericLevel)

  return (
    <Tag
      label={enadeLabel(level)}
      className={className}
      style={{
        background: palette.background,
        borderColor: palette.color,
        color: palette.color,
      }}
    />
  )
}
