'use client'

import { cn } from '@/utils/cn'
import { BaseComponents } from './sections/base-components'
import { EnadeSection } from './sections/enade'
import { Experiments } from './sections/experiments'
import { Patterns } from './sections/patterns'
import { Tokens } from './sections/tokens'

const NAV = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'base', label: 'Componentes base' },
  { id: 'enade', label: 'Enade' },
  { id: 'patterns', label: 'Composições e padrões' },
  { id: 'experiments', label: 'Experiments' },
]

export default function DesignSystem() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-fg-muted">
          Design system · interna
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-fg">
          Padrões e componentes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Página de teste visual e documentação de padrões. Fica fora dos menus
          (sem links) e não é indexada.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav
          aria-label="Índice da página"
          className="lg:sticky lg:top-20 lg:h-fit"
        >
          <ul className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    'inline-block rounded-control px-3 py-1.5 text-sm font-semibold text-fg-muted',
                    'transition-colors hover:bg-accent/10 hover:text-accent-deep',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-col gap-14">
          <Tokens />
          <BaseComponents />
          <EnadeSection />
          <Patterns />
          <Experiments />
        </div>
      </div>
    </div>
  )
}
