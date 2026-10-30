'use client'

import Link from 'next/link'
import { CompareActions } from '@/components/compare/compare-actions'
import { useCompareCursos } from '@/components/compare/compare-provider'
import { BackLink } from '@/components/ui/back-link/back-link'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { NauticalIcon } from '../../ui/route/icons/nautical-icon'
import { Menu } from '../menu/menu'

export type HeaderVariant = 'home' | 'inner' | 'profile'

interface HeaderProps {
  className?: string
  variant?: HeaderVariant
  module?: Module
}

export const Header = ({
  className,
  variant = 'home',
  module,
}: HeaderProps) => {
  const { ids } = useCompareCursos()
  const comparing = ids.length > 0

  if (variant === 'inner') {
    return (
      <header
        data-module={module}
        className={cn(
          'flex h-[64px] items-center justify-between px-5',
          'mx-auto w-full bg-surface-lv1',
          'border-b border-accent/40',
          className,
        )}
      >
        <BackLink label="Voltar" />

        <div className="flex items-center gap-3">
          {module &&
            (comparing ? (
              <CompareActions variant="neutral" />
            ) : (
              <Link
                data-module={module}
                href={MODULE_META[module].href}
                className="rounded-full bg-accent px-[1.15rem] py-2 text-xs font-semibold text-fg transition-transform duration-fast hover:-translate-y-px"
              >
                {MODULE_META[module].title}
              </Link>
            ))}
          <Menu mode="light" module={module} />
        </div>
      </header>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="w-full">
        <header
          data-module={module}
          className={cn(
            'flex items-center justify-between p-4 pb-0 bg-surface-lv1',
            'mx-auto w-full pb-1',
            className,
          )}
        >
          <BackLink label="Voltar" />

          <div className="flex items-center gap-3">
            {module && (
              <Tag
                label={MODULE_META[module].title}
                module={module}
                className="font-semibold px-[10px] py-[3px] tracking-[0.5px] mr-0 text-2xs"
                variant="module"
              />
            )}
            <Menu module={module} />
          </div>
        </header>
      </div>
    )
  }

  return (
    <header
      className={cn(
        'flex h-[52px] items-center justify-between bg-surface-header px-5 py-2',
        'mx-auto w-full',
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span aria-hidden className="block h-7 w-7">
          <NauticalIcon className="w-7 h-7" />
        </span>
        <span className="text-sm font-semibold tracking-[-0.2px] text-on-dark">
          So<span className="text-m1-accent">U</span>_Estudante
        </span>
      </Link>
      <div className="flex items-center gap-3 text-xs text-on-dark/[.45]">
        <a
          href="https://souciencia.unifesp.br"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-fast hover:text-on-dark/80"
        >
          SoU_Ciência
        </a>
        <Menu mode="dark" />
      </div>
    </header>
  )
}
