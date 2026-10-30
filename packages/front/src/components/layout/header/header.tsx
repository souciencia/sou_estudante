'use client'

import Link from 'next/link'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { NauticalIcon } from '../../ui/route/icons/nautical-icon'
import { Menu } from '../menu/menu'

export type HeaderVariant = 'home' | 'inner' | 'profile'

interface HeaderProps {
  className?: string
  variant?: HeaderVariant
  module?: Module
}

function SiteLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center gap-2.5', className)}>
      <span aria-hidden className="block h-7 w-7">
        <NauticalIcon className="w-7 h-7" />
      </span>
      <span className="text-sm font-semibold tracking-[-0.2px]">
        So<span className="text-m1-accent">U</span>_Estudante
      </span>
    </Link>
  )
}

export const Header = ({
  className,
  variant = 'home',
  module,
}: HeaderProps) => {
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
        <SiteLogo className="text-fg" />

        <Menu mode="light" module={module} />
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
            'mx-auto w-full',
            'border-b border-accent/40',
            className,
          )}
        >
          <SiteLogo className="text-fg" />

          <Menu module={module} variant="profile" />
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
      <SiteLogo className="text-on-dark" />
      <Menu mode="dark" />
    </header>
  )
}
