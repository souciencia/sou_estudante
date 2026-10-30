'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useCompareCursos } from '@/components/compare/compare-provider'
import { MODULE_META, MODULES, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface MenuProps {
  mode?: 'light' | 'dark'
  module?: Module
  variant?: 'full' | 'profile'
}

const ITEM =
  'flex w-full items-center gap-[11px] px-5 py-[0.7rem] text-left text-sm text-fg transition-colors duration-fast hover:bg-muted'
const PONTO = 'h-[9px] w-[9px] shrink-0 rounded-full'
const DESK_LINK =
  'rounded-full px-3 py-1.5 text-sm transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2'

export function Menu({ mode = 'light', module, variant = 'full' }: MenuProps) {
  const [opened, setOpened] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const fecharRef = useRef<HTMLButtonElement>(null)
  const { ids, clear } = useCompareCursos()
  const count = ids.length

  useEffect(() => {
    if (!opened) return
    document.body.style.overflow = 'hidden'
    fecharRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpened(false)
        return
      }

      if (e.key !== 'Tab') return

      const focaveis =
        drawerRef.current?.querySelectorAll<HTMLElement>('button, a[href]')

      if (!focaveis || focaveis.length === 0) return

      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      buttonRef.current?.focus()
    }
  }, [opened])

  const navLinkClass = (isActive: boolean) =>
    cn(
      DESK_LINK,
      mode === 'dark'
        ? 'text-on-dark/70 hover:text-on-dark focus-visible:outline-on-dark'
        : isActive
          ? 'font-semibold text-accent-deep focus-visible:outline-accent-deep'
          : 'text-fg-muted hover:text-fg focus-visible:outline-accent-deep',
    )

  const compareNav = (isActive: boolean) => (
    <span
      data-module="5"
      className={cn(
        'flex items-center',
        count > 0 && 'rounded-full border border-accent',
      )}
    >
      <Link
        href="/comparar"
        aria-current={isActive ? 'page' : undefined}
        className={
          count > 0
            ? cn(
                'py-1.5 pl-3 pr-0.5 text-sm font-bold transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2',
                mode === 'dark'
                  ? 'text-on-dark focus-visible:outline-on-dark'
                  : 'text-accent-deep focus-visible:outline-accent-deep',
              )
            : navLinkClass(isActive)
        }
      >
        {count > 0 ? `Comparar (${count})` : 'Comparar'}
      </Link>
      {count > 0 && (
        <button
          type="button"
          onClick={clear}
          aria-label="Limpar comparação"
          className={cn(
            'mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-full transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2',
            mode === 'dark'
              ? 'text-on-dark/70 hover:text-on-dark focus-visible:outline-on-dark'
              : 'text-accent-deep hover:bg-accent/10 focus-visible:outline-accent-deep',
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  )

  return (
    <>
      <nav
        aria-label="Navegação principal"
        data-module={module}
        className="hidden md:flex md:items-center md:gap-1"
      >
        {variant === 'profile' ? (
          <>
            <Link href="/cursos" className={navLinkClass(false)}>
              Cursos
            </Link>
            {compareNav(false)}
          </>
        ) : (
          MODULES.map((item) => {
            if (item === '5') {
              return (
                <Fragment key={item}>{compareNav(item === module)}</Fragment>
              )
            }
            const meta = MODULE_META[item]
            const isActive = item === module
            return (
              <Link
                key={item}
                href={meta.href}
                aria-current={isActive ? 'page' : undefined}
                className={navLinkClass(isActive)}
              >
                {meta.navTitle}
              </Link>
            )
          })
        )}
      </nav>

      <button
        type="button"
        ref={buttonRef}
        aria-label="Menu"
        aria-expanded={opened}
        data-module={module}
        onClick={() => setOpened(true)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:hidden',
          mode === 'dark'
            ? 'bg-on-dark/10 text-on-dark hover:bg-on-dark/[.18]'
            : module
              ? 'border border-accent-deep/50 bg-accent text-accent-fg hover:bg-accent/80'
              : 'bg-fg text-on-dark hover:bg-fg/80',
        )}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            d="M2 4H14M2 8H14M2 12H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        aria-hidden="true"
        onClick={() => setOpened(false)}
        className={cn(
          'fixed inset-0 z-[1200] bg-navy-900/50 transition-opacity duration-cruise',
          opened ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        id="nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!opened}
        className={cn(
          'fixed inset-y-0 right-0 z-[1210] flex w-[280px] max-w-[84vw] flex-col overflow-y-auto bg-surface-lv2 shadow-[-12px_0_40px_color-mix(in_srgb,var(--color-navy-900)_25%,transparent)] transition-transform duration-cruise ease-tide',
          opened ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-border-secondary px-5 py-[1.1rem]">
          <span className="font-display text-base font-semibold text-fg">
            SoU_Estudante
          </span>
          <button
            ref={fecharRef}
            type="button"
            aria-label="Fechar"
            onClick={() => setOpened(false)}
            className="p-1 text-fg-muted transition-colors duration-fast hover:text-fg"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                d="M3 3L13 13M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Links */}
        <Link href="/" className={ITEM} onClick={() => setOpened(false)}>
          <span aria-hidden className={cn(PONTO, 'bg-fg')} />
          Início
        </Link>

        <div className="px-5 pb-[0.4rem] pt-4 text-xs font-bold uppercase tracking-[0.8px] text-fg-muted">
          Módulos
        </div>

        {MODULES.map((module) => {
          if (module === '5') {
            return (
              <div
                key={module}
                data-module={module}
                className="flex items-center"
              >
                <Link
                  href="/comparar"
                  className={cn(ITEM, 'flex-1')}
                  onClick={() => setOpened(false)}
                >
                  <span aria-hidden className={cn(PONTO, 'bg-accent')} />
                  {count > 0 ? `Comparar cursos (${count})` : 'Comparar cursos'}
                </Link>
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clear()
                      setOpened(false)
                    }}
                    aria-label="Limpar comparação"
                    className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-fg-muted transition-colors duration-fast hover:bg-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )
          }
          return (
            <Link
              key={module}
              data-module={module}
              href={MODULE_META[module].href}
              className={ITEM}
              onClick={() => setOpened(false)}
            >
              <span aria-hidden className={cn(PONTO, 'bg-accent')} />
              {MODULE_META[module].title}
            </Link>
          )
        })}
      </aside>
    </>
  )
}
