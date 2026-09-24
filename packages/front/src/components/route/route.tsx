'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Tag } from '@/components/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { AnchorIcon } from './icons/AnchorIcon'
import { CompassIcon } from './icons/CompassIcon'
import { NauticalIcon } from './icons/NauticalIcon'
import { SextantIcon } from './icons/SextantIcon'
import { TelescopeIcon } from './icons/TelescopeIcon'

export type RouteVariant = 'card' | 'inline'

interface RouteProps {
  module: Module
  v?: RouteVariant
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
  v = 'card',
  title,
  description,
  className,
}: RouteProps) {
  const meta = MODULE_META[module]
  const Icon = ICONS[module]
  const routeTitle = title ?? meta.title
  const routeDescription = description ?? meta.description

  if (v === 'inline') {
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
        'group relative overflow-hidden flex flex-col items-center bg-white text-center rounded-[20px] border border-card-border px-4 py-5 hover:-translate-y-0.5',

        // Animação para passagem de mouse:
        "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px]",
        'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
        'before:bg-accent',

        className,
      )}
    >
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
    </Link>
  )
}
