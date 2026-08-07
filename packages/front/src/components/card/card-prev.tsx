import type { OfertaCompleta } from '@/services/api/types'
import { Typo } from '../text/typo'

interface CardProps {
  module?: 1 | 2 | 3 | 4 | 5
  className?: string
  oferta: OfertaCompleta
}

export default function Card({ module, oferta }: CardProps) {
  const nomeCurso = oferta.curso?.no_curso || 'Curso não especificado'
  const siglaIES = oferta.instituicao?.sg_ies || ''

  return (
    <article
      // Injeta os tokens semânticos do módulo correspondente no escopo do elemento pai
      style={
        {
          '--module-color': `var(--color-module-${module})`,
          '--module-color-light': `var(--color-module-${module}-light)`,
          '--module-color-dark': `var(--color-module-${module}-dark)`,
        } as React.CSSProperties
      }
      className="border p-6 rounded-lg border-t-4"
    >
      <div className="space-y-4">
        <Typo s="lg" t="h3" className="cursor-auto">
          {nomeCurso}
        </Typo>
        <Typo s="sm" t="p" v="mute" className="cursor-auto">
          {siglaIES}
        </Typo>
      </div>
    </article>
  )
}
