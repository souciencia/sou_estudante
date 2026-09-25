'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { AnchorIcon } from './icons/AnchorIcon'
import { CompassIcon } from './icons/CompassIcon'
import { NauticalIcon } from './icons/NauticalIcon'
import { SextantIcon } from './icons/SextantIcon'
import { TelescopeIcon } from './icons/TelescopeIcon'
import IconModule from '../icon-module/iconModule'

export type RouteVariant = 'card' | 'inline' | 'list'

interface RouteProps {
  module: Module
  variant?: RouteVariant
  title?: string
  description?: string
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
  className,
}: RouteProps) {
  const meta = MODULE_META[module]
  const Icon = ICONS[module]
  const routeTitle = title ?? meta.title
  const routeDescription = description ?? meta.description
  const isCard = variant === 'card'

  if (variant === 'inline') {
    return (
      <Link
        data-module={module}
        href={meta.href}
        className={cn(
          'group flex items-center gap-4 rounded-[20px] border border-card-border bg-card-surface px-4 py-4',
          'transition-transform hover:-translate-y-0.5',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          className,
        )}
      >
        <Icon className="size-12 shrink-0" />
        <span className="flex flex-1 flex-col">
          <span className="font-title-protagonist font-bold text-protagonist">
            {routeTitle}
          </span>
          <span className="text-coadjuvant text-fg-muted">
            {routeDescription}
          </span>
        </span>
        <ArrowRight
          className="size-5 text-fg-muted transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <Link
      data-module={module}
      href={meta.href}
      className={cn(
        'group relative overflow-hidden bg-white border border-card-border',

        isCard && [
          'flex flex-col items-center text-center rounded-[20px] px-4 py-5 hover:-translate-y-0.5',

          // Animação para passagem de mouse:
          "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px]",
          'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
          'before:bg-accent',
        ],

        !isCard && [
          'flex items-start gap-3 rounded-[14px] transition-transform hover:translate-x-0.5 shadow-[inset_3px_0_0_var(--color-accent)] px-4 py-3',
        ],

        className,
      )}
    >
      {isCard && (
        <>
          <Icon className="mb-3" />
          <h3 className="font-title-protagonist font-bold text-coadjuvant-sm mb-[3px] leading-[1.3]">
            {routeTitle}
          </h3>
          <p className="text-coadjuvant-xs text-fg-muted leading-[1.35]">
            {routeDescription}
          </p>
          <Tag
            label={meta.badge}
            module={module}
            className="border-none bg-accent/20 font-semibold mt-2 py-[2px]"
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
            <span className="block mb-[2px] font-bold text-coadjuvant-xs text-accent-deep tracking-[0.6px]">
              {meta.badge}
            </span>
            <h3 className="block font-semibold text-protagonist-sm">
              {meta.list.title}
            </h3>
            <p className="text-coadjuvant-sm leading-[1.45] text-fg-muted">
              {meta.list.description}
            </p>
          </span>
        </>
      )}
    </Link>
  )
}
