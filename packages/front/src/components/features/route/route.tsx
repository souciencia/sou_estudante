'use client'

import Link from 'next/link'
import { Tag } from '@/components/atoms/tag'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { AnchorIcon } from './icons/AnchorIcon'
import { CompassIcon } from './icons/CompassIcon'
import { NauticalIcon } from './icons/NauticalIcon'
import { SextantIcon } from './icons/SextantIcon'
import { TelescopeIcon } from './icons/TelescopeIcon'
import IconModule from '@/components/atoms/iconModule'

interface RouteProps {
  module: Module
  variant?: 'bloc' | 'list'
  className?: string
}

const ROUTES = {
  '1': {
    bloc: { title: 'Escolher curso', description: 'Explore por área, localização e modalidade' },
    list: { title: 'Escolha um curso', description: 'A carta náutica mapeia as rotas possíveis: explore os cursos por área, local e modalidade.' },
    description: 'Explore por área, localização e modalidade',
    badge: 'CARTA NÁUTICA',
    href: '#',
    icon: NauticalIcon,
  },
  '2': {
    bloc: { title: 'Como ingressar', description: 'Notas de corte, vagas e cotas no Sisu' },
    list: { title: 'Veja como ingressar', description: 'A bússola aponta o caminho da entrada: notas de corte, vagas e cotas no Sisu.' },
    description: 'Notas de corte, vagas e cotas no Sisu',
    badge: 'BÚSSOLA',
    href: '#',
    icon: CompassIcon,
  },
  '3': {
    bloc: { title: 'Como permanecer', description: 'Cotas, assistência e apoios estudantis' },
    list: { title: 'Encontre apoio para permanecer', description: 'A âncora segura você no percurso: bolsas, cotas e apoios para chegar até a formatura.' },
    description: 'Cotas, assistência e apoios estudantis',
    badge: 'ÂNCORA',
    href: '#',
    icon: AnchorIcon,
  },
  '4': {
    bloc: { title: 'Conhecer instituição', description: 'Indicadores, docentes e qualidade' },
    list: { title: 'Conheça a instituição', description: 'O telescópio aproxima o que está longe: os indicadores oficiais da instituição, traduzidos.' },
    description: 'Indicadores, docentes e qualidade',
    badge: 'TELESCÓPIO',
    href: '#',
    icon: TelescopeIcon,
  },
  '5': {
    bloc: { title: 'Comparar cursos', description: 'Analise até 4 cursos lado a lado' },
    list: { title: 'Compare lado a lado', description: 'O sextante mede posições para orientar a escolha: até quatro cursos comparados pelos mesmos critérios, sem ranking.' },
    description: 'Analise até 4 cursos lado a lado',
    badge: 'SEXTANTE',
    href: '#',
    icon: SextantIcon,
  },
}

export function Route({ module, variant='bloc', className }: RouteProps) {
  const route = ROUTES[module]
  const Icon = route.icon
  const content = route[variant]
  const isBloc = variant === 'bloc'

  return (
    <Link
      data-module={module}
      href={route.href}
      className={cn(
        'group relative overflow-hidden bg-white border border-card-border',

        isBloc && [
          'flex flex-col items-center text-center rounded-[20px] px-4 py-5 hover:-translate-y-0.5',

          // Animação para passagem de mouse:
          "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:h-[3px]",
          'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
          'before:bg-accent',
        ],

        !isBloc && [
          'flex items-start gap-3 rounded-[14px] transition-transform hover:translate-x-0.5 shadow-[inset_3px_0_0_var(--color-accent)] px-4 py-3'
        ],
        
        className,
      )}
    >
      {isBloc && (
        <>
          <Icon className="mb-3" />
          <h3 className="font-title-protagonist font-bold text-coadjuvant-sm mb-[3px] leading-[1.3]">
            {content.title}
          </h3>
          <p className="text-coadjuvant-xs text-fg-muted leading-[1.35]">
            {content.description}
          </p>
          <Tag
            label={route.badge}
            module={module}
            className="border-none bg-accent/20 font-semibold mt-2 py-[2px]"
          />
        </>
      )}

      {!isBloc && (
        <>
          <span aria-hidden className='flex h-6 w-6 items-center justify-center rounded-full bg-accent'>
            <IconModule module={module} />
          </span>

          <span className='min-w-0'>
            <span className='block mb-[2px] font-bold text-coadjuvant-xs text-accent-deep tracking-[0.6px]'>
                {route.badge}
            </span>
            <h3 className="block font-semibold text-protagonist-sm">
              {content.title}
            </h3>
            <p className="text-coadjuvant-sm leading-[1.45] text-fg-muted">
              {content.description}
            </p>
          </span>
        </>
      )}
    </Link>
  )
}
