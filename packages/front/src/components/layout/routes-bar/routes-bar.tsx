import Link from 'next/link'
import { MODULE_META, MODULES, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface RoutesBarProps {
  module?: Module
  className?: string
}

function RouteLineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <path
        d="M2.5 11.5C5.5 11.5 6.5 4.5 9 4.5s2.5 4.5 4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="2.5" cy="11.5" r="1.3" fill="currentColor" />
      <circle cx="13.5" cy="9" r="1.3" fill="currentColor" />
    </svg>
  )
}

/**
 * Barra de rotas exibida abaixo do cabeçalho nas páginas internas: replica os
 * módulos de navegação e destaca a rota ativa. A borda inferior atravessa a
 * largura total; o conteúdo respeita o container das páginas.
 */
export function RoutesBar({ module, className }: RoutesBarProps) {
  return (
    <nav
      aria-label="Rotas"
      data-module={module}
      className={cn(
        'border-b border-card-border bg-site-background',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-pages items-center gap-5 overflow-x-auto px-5">
        <span className="flex shrink-0 items-center gap-[7px] py-3 text-coadjuvant-xs font-bold uppercase tracking-[0.9px] text-fg-muted">
          <RouteLineIcon className="size-[14px]" />
          Rota
        </span>

        <span aria-hidden className="h-4 w-px shrink-0 bg-card-border" />

        <ul className="flex items-center gap-6">
          {MODULES.map((item) => {
            const meta = MODULE_META[item]
            const isActive = item === module

            return (
              <li key={item} data-module={item} className="shrink-0">
                <Link
                  href={meta.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 border-b-2 py-3 text-coadjuvant-sm transition-colors duration-fast',
                    isActive
                      ? 'border-accent font-semibold text-accent-deep'
                      : 'border-transparent text-fg-muted hover:text-fg-protagonist',
                  )}
                >
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full bg-accent"
                  />
                  {meta.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
