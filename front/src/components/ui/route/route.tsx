import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { IconModule } from '../icon-module/icon-module'
import { AnchorIcon } from './icons/anchor-icon'
import { CompassIcon } from './icons/compass-icon'
import { NauticalIcon } from './icons/nautical-icon'
import { SextantIcon } from './icons/sextant-icon'
import { TelescopeIcon } from './icons/telescope-icon'

export type RouteVariant = 'card' | 'inline' | 'list'

interface RouteProps {
  module: Module
  variant?: RouteVariant
  title?: string
  description?: string
  /** Destino do link; por padrão o `href` do módulo. */
  href?: string
  className?: string
}

const ICONS = {
  '1': NauticalIcon,
  '2': CompassIcon,
  '3': AnchorIcon,
  '4': TelescopeIcon,
  '5': SextantIcon,
} as const

export function Route({
  module,
  variant = 'card',
  title,
  description,
  href,
  className,
}: RouteProps) {
  const meta = MODULE_META[module]
  const Icon = ICONS[module]
  const routeTitle = title ?? meta.title
  const routeDescription = description ?? meta.description
  const routeHref = href ?? meta.href
  const isCard = variant === 'card'

  if (variant === 'inline') {
    return (
      <Link
        data-module={module}
        href={routeHref}
        className={cn(
          'group flex items-center gap-4 rounded-card border border-border-primary bg-surface-lv2 px-4 py-4',
          'transition-transform hover:-translate-y-0.5',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          className,
        )}
      >
        <Icon className="size-9 shrink-0" />
        <span className="flex flex-1 flex-col">
          <span className="font-sans font-bold text-sm">{routeTitle}</span>
          <span className="text-xs text-fg-muted">{routeDescription}</span>
        </span>
        <ArrowRight
          className="size-4 text-fg-muted transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <Link
      data-module={module}
      href={routeHref}
      className={cn(
        'group relative overflow-hidden bg-surface-lv2 border border-border-primary',

        isCard && [
          'flex flex-col items-center text-center rounded-card px-4 py-5 hover:-translate-y-0.5',

          // Animação para passagem de mouse:
          "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px]",
          'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
          'before:bg-accent',
        ],

        !isCard && [
          'flex items-start gap-3 rounded-panel transition-transform hover:translate-x-0.5 shadow-[inset_3px_0_0_var(--color-accent)] px-4 py-3',
        ],

        className,
      )}
    >
      {isCard && (
        <>
          <Icon className="mb-3" />
          <h3 className="font-sans font-bold text-xs mb-[3px] leading-[1.3]">
            {routeTitle}
          </h3>
          <p className="text-2xs text-fg-muted leading-[1.35]">
            {routeDescription}
          </p>
          <Tag
            label={meta.badge}
            module={module}
            className="border-none bg-accent/20 font-semibold mt-2 py-[2px]"
            variant="module"
          />
        </>
      )}

      {!isCard && (
        <>
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-accent"
          >
            <IconModule module={module} />
          </span>

          <span className="min-w-0">
            <span className="block mb-[2px] font-bold text-xs text-accent-deep tracking-[0.6px]">
              {meta.badge}
            </span>
            <h3 className="block font-semibold text-sm">{meta.list.title}</h3>
            <p className="text-xs leading-[1.45] text-fg-muted">
              {meta.list.description}
            </p>
          </span>
        </>
      )}
    </Link>
  )
}
