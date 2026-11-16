/**
 * MaskEnade — versão decorativa e ampliada do "mar do Enade" usada como fundo
 * do card de curso (ancorada à direita). A "separação" com o card é feita por
 * um `<mask-image>` SVG (silhueta de `_docs/imgs/exemplo_mask.png`), e não por
 * um `border-radius`. O desenho da faixa vive em ConceitoEnade. Puramente
 * decorativo: não recebe ponteiro e é `aria-hidden` — a informação acessível
 * vive no SeloEnade.
 */
import { ConceitoEnade } from '@/components/enade/formas-enade/conceito-enade'
import { marPalette } from '@/components/enade/formas-enade/geometria-mar'
import type { EnadeLevel } from '@/lib/enade'
import { cn } from '@/utils/cn'

// Silhueta da borda esquerda (viewBox 0 0 100 100, esticada ao box do elemento).
const MASK_SHAPE = encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M8.25 0H100V100H8.25C8.25 100 -1.3125 69.5 8.25 50C17.8125 30.5 8.25 0 8.25 0Z' fill='white'/></svg>",
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
        'pointer-events-none absolute inset-y-0 right-0 w-[26%] max-w-[230px]',
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
      <ConceitoEnade level={level} className="h-full w-full" />
      <div className='absolute top-0 flex flex-col place-content-center size-full font-black font-display'>
        <span className='text-4xl text-white self-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]'>{level}</span> 
        <span className='text-xl text-white self-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]'>Enade</span>
      </div>
    </div>
  )
}
