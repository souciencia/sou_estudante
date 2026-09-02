import type { Curso } from '@/services/api/types'
import { Typo } from '../../atoms/typo'

interface CardProps {
  module?: 1 | 2 | 3 | 4 | 5
  className?: string
  curso: Curso
}

export default function Card({ module, curso }: CardProps) {
  const nomeCurso = curso.curso?.no_curso || 'Curso não especificado'
  const siglaIES = curso.instituicao?.co_ies || ''

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
