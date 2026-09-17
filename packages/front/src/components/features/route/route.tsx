'use client'

import { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { CompassIcon } from './icons/CompassIcon'
import { SextantIcon } from './icons/SextantIcon'
import { AnchorIcon } from './icons/AnchorIcon'
import { TelescopeIcon } from './icons/TelescopeIcon'
import { NauticalIcon } from './icons/NauticalIcon'
import { Tag } from '@/components/atoms/tag'
import Link from 'next/link'

interface RouteProps {
  module: Module
  className?: string
}

const ROUTES = {
  '1': {
    title: 'Escolher curso',
    description: 'Explore por área, localização e modalidade',
    badge: 'CARTA NÁUTICA',
    href: '#',
    icon: NauticalIcon,
  },
  '2': {
    title: 'Como ingressar',
    description: 'Notas de corte, vagas e cotas no Sisu',
    badge: 'BÚSSOLA',
    href: '#',
    icon: CompassIcon,
  },
  '3': {
    title: 'Como permanecer',
    description: 'Cotas, assistência e apoios estudantis',
    badge: 'ÂNCORA',
    href: '#',
    icon: AnchorIcon,
  },
  '4': {
    title: 'Conhecer instituição',
    description: 'Indicadores, docentes e qualidade',
    badge: 'TELESCÓPIO',
    href: '#',
    icon: TelescopeIcon,
  },
  '5': {
    title: 'Comparar cursos',
    description: 'Analise até 4 cursos lado a lado',
    badge: 'SEXTANTE',
    href: '#',
    icon: SextantIcon,
  },
}

export function Route({ module, className }: RouteProps) {
  const route = ROUTES[module]
  const Icon = route.icon

  return (
    <Link
      data-module={module}
      href={route.href}
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
        {route.title}
      </h3>
      <p className="text-coadjuvant-xs text-fg-muted leading-[1.35]">
        {route.description}
      </p>
      <Tag
        label={route.badge}
        module={module}
        className="border-none bg-accent/20 font-semibold mt-2 py-[2px]"
      />
    </Link>
  )
}
