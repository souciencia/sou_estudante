'use client'

import { Compass } from 'lucide-react'
import Link from 'next/link'
import { SiteMenu } from '@/components/site-blocks/site-menu/site-menu'
import { SITE_MENU_LINKS } from '@/components/site-blocks/site-menu/site-menu-links'
import { cn } from '@/utils/cn'

interface HeaderProps {
  className?: string
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-card-border bg-card-surface',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-8">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 rounded-full font-title-protagonist text-protagonist-lg font-bold text-fg-protagonist',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          )}
        >
          <Compass className="size-6 text-accent-deep" aria-hidden="true" />
          <span>Sou Estudante</span>
        </Link>

        <SiteMenu>
          <SiteMenu.Trigger />
          <SiteMenu.List>
            {SITE_MENU_LINKS.map(({ href, label }) => (
              <SiteMenu.Item key={href} href={href}>
                {label}
              </SiteMenu.Item>
            ))}
          </SiteMenu.List>
        </SiteMenu>
      </div>
    </header>
  )
}
