import Link from 'next/link'
import { BackLink } from '@/components/ui/back-link/back-link'
import { MODULE_META, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { NauticalIcon } from '../../ui/route/icons/NauticalIcon'
import Menu from '../menu/menu'

export type HeaderVariant = 'home' | 'inner'

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
  if (variant === 'inner') {
    return (
      <header
        className={cn(
          'sticky top-0 z-[600] flex h-[64px] items-center justify-between bg-site-background px-5',
          'mx-auto w-full',
          className,
        )}
      >
        <BackLink label="Início" />

        <div className="flex items-center gap-3">
          {module && (
            <Link
              data-module={module}
              href={MODULE_META[module].href}
              className="rounded-[24px] bg-accent px-[1.15rem] py-2 text-coadjuvant-sm font-semibold text-fg-protagonist transition-transform duration-fast hover:-translate-y-px"
            >
              {MODULE_META[module].title}
            </Link>
          )}
          <Menu mode="light" />
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-[600] flex h-[52px] items-center justify-between bg-navy-900 px-5',
        'mx-auto w-full',
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span aria-hidden className="block h-7 w-7">
          <NauticalIcon className="w-7 h-7" />
        </span>
        <span className="text-sm font-semibold tracking-[-0.2px] text-white">
          So<span className="text-m1-accent">U</span>_Estudante
        </span>
      </Link>
      <div className="flex items-center gap-3 text-coadjuvant-sm text-white/[.45]">
        <a
          href="https://souciencia.unifesp.br"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-fast hover:text-white/80"
        >
          SoU_Ciência
        </a>
        <Menu mode="dark" />
      </div>
    </header>
  )
}
