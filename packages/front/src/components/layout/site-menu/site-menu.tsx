'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useId, useState } from 'react'
import { cn } from '@/utils/cn'
import { SiteMenuContext, useSiteMenu } from './site-menu-context'

interface SiteMenuProps {
  children: ReactNode
  className?: string
}

interface SiteMenuTriggerProps {
  className?: string
}

interface SiteMenuListProps {
  children: ReactNode
  className?: string
}

interface SiteMenuItemProps {
  href: string
  children: ReactNode
  className?: string
}

const SiteMenuRoot = ({ children, className }: SiteMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const listId = useId()

  return (
    <SiteMenuContext.Provider
      value={{
        isOpen,
        listId,
        toggle: () => setIsOpen((open) => !open),
        close: () => setIsOpen(false),
      }}
    >
      <nav
        aria-label="Navegação principal"
        className={cn('relative md:static', className)}
      >
        {children}
      </nav>
    </SiteMenuContext.Provider>
  )
}

const SiteMenuTrigger = ({ className }: SiteMenuTriggerProps) => {
  const { isOpen, listId, toggle } = useSiteMenu()

  return (
    <button
      type="button"
      aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={isOpen}
      aria-controls={listId}
      onClick={toggle}
      className={cn(
        'inline-flex items-center justify-center rounded-full p-2 text-fg-coadjuvant transition-colors hover:bg-accent/10',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        'md:hidden',
        className,
      )}
    >
      {isOpen ? (
        <X className="size-5" aria-hidden="true" />
      ) : (
        <Menu className="size-5" aria-hidden="true" />
      )}
    </button>
  )
}

const SiteMenuList = ({ children, className }: SiteMenuListProps) => {
  const { isOpen, listId } = useSiteMenu()

  return (
    <ul
      id={listId}
      className={cn(
        'absolute inset-x-0 top-full z-50 flex-col gap-1 border-b border-card-border bg-card-surface p-4',
        'md:static md:z-auto md:flex md:flex-row md:items-center md:gap-2 md:border-none md:bg-transparent md:p-0',
        isOpen ? 'flex' : 'hidden',
        className,
      )}
    >
      {children}
    </ul>
  )
}

const SiteMenuItem = ({ href, children, className }: SiteMenuItemProps) => {
  const pathname = usePathname()
  const { close } = useSiteMenu()
  const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href)

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        onClick={close}
        className={cn(
          'block rounded-full px-4 py-2 font-coadjuvant text-coadjuvant font-semibold transition-colors',
          isActive
            ? 'bg-accent/20 text-accent-deep'
            : 'text-fg-coadjuvant hover:bg-accent/10 hover:text-accent-deep',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          className,
        )}
      >
        {children}
      </Link>
    </li>
  )
}

export const SiteMenu = Object.assign(SiteMenuRoot, {
  Trigger: SiteMenuTrigger,
  List: SiteMenuList,
  Item: SiteMenuItem,
})
