/**
 * MaskEnade — versão decorativa e estreita do "mar do Enade" usada como fundo
 * do card de curso (ancorada à direita). A "separação" com o card é feita por
 * um `<mask-image>` SVG (silhueta de `_docs/enade/mask.svg`), e não por um
 * `border-radius`. O desenho da faixa vive em ConceitoEnade (variante
 * `narrow`, recortada à direita a partir de `_docs/enade/lvl-*.svg`).
 * Puramente decorativo: não recebe ponteiro e é `aria-hidden` — a informação
 * acessível vive no SeloEnade.
 */
import { ConceitoEnade } from '@/components/enade/formas-enade/conceito-enade'
import { marPalette } from '@/components/enade/formas-enade/geometria-mar'
import type { EnadeLevel } from '@/lib/enade'
import { cn } from '@/utils/cn'

// Silhueta da borda esquerda (viewBox 0 0 51 100, esticada ao box do elemento).
const MASK_SHAPE = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 51 100' preserveAspectRatio='none'><path d='M4.25 0H50.125V40.5V71V100H4.25C4.25 100 -5.3125 69.5 4.25 50C13.8125 30.5 4.25 0 4.25 0Z' fill='white'/></svg>",
)

interface Props {
  level: EnadeLevel
  className?: string
}

export function MaskEnade({ level, className }: Props) {
  const numericLevel = typeof level === 'number' ? level : null
  const palette = marPalette(numericLevel)
  const maskImage = `url("data:image/svg+xml,${MASK_SHAPE}")`

  return (
    <div
      data-mask="enade"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-y-0 right-0 w-[18%] max-w-[150px]',
        className,
      )}
      style={{
        background: palette.background,
        color: palette.color,
        maskImage,
        WebkitMaskImage: maskImage,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
    >
      <ConceitoEnade
        level={level}
        variant="narrow"
        preserveAspectRatio="none"
        className="h-full w-full"
      />
    </div>
  )
}
