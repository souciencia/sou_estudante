import { Signpost } from 'lucide-react'
import Link from 'next/link'
import type { Module } from '@/lib/module'
import { buildIesHref } from '@/lib/profile-links'
import { cn } from '@/utils/cn'

/**
 * Rotas do perfil com nomes enxutos: apenas o texto exibido e o href de cada
 * destino. Não reutiliza o `MODULE_META` global, que carrega copy completo.
 */
const MODULE_META = {
  '1': { title: 'Geral', href: '/cursos' },
  '2': { title: 'Ingresso', href: '/ingresso' },
  '3': { title: 'Permanência', href: '/permanencia' },
  '4': { title: 'Instituição', href: '/ies' },
} as const

type RouteKey = keyof typeof MODULE_META

/**
 * Resolve o href de uma rota: quando há contexto (curso/IES exibido), aponta
 * para o perfil correspondente; caso contrário, cai na página de listagem.
 */
function routeHref(item: RouteKey, courseId?: number, iesId?: string): string {
  const base = MODULE_META[item].href

  if (item === '4') {
    return iesId !== undefined ? buildIesHref(iesId, courseId) : base
  }

  return courseId !== undefined ? `${base}/${courseId}` : base
}

export interface ProfileRoutesProps {
  module?: Module
  /** Id do curso exibido: aponta as rotas para os perfis do mesmo curso. */
  courseId?: number
  /** Id da IES do curso exibido: aponta "Instituição" para o perfil da IES. */
  iesId?: string
  className?: string
}

/**
 * Barra de rotas no topo do perfil: replica os módulos de navegação e destaca
 * a rota ativa. A borda inferior atravessa a largura total; o conteúdo respeita
 * o container das páginas.
 */
export function ProfileRoutes({
  module,
  courseId,
  iesId,
  className,
}: ProfileRoutesProps) {
  return (
    <nav
      aria-label="Rotas"
      data-module={module}
      className={cn(
        'border-b border-border-primary bg-surface-lv2-lv2-lv1 flex flex-wrap items-center w-full gap-2 sm:gap-4 px-4',
        className,
      )}
    >
      <span className="flex items-center gap-1 border-r border-border-primary text-2xs font-bold text-fg-muted pr-4 shrink-0">
        <Signpost className="size-3" />
        ROTA
      </span>

      {(Object.keys(MODULE_META) as RouteKey[]).map((item) => {
        const meta = MODULE_META[item]
        const isActive = item === module
        const href = routeHref(item, courseId, iesId)

        return (
          <Link
            href={href}
            aria-current={isActive ? 'page' : undefined}
            key={item}
            data-module={item}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 border-b-2 py-3 text-xs transition-colors duration-fast text-center',
              isActive
                ? 'border-accent font-semibold text-accent-deep'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-accent"
            />
            {meta.title}
          </Link>
        )
      })}
    </nav>
  )
}
