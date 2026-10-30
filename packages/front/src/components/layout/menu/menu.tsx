'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { MODULE_META, MODULES, type Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface MenuProps {
  mode?: 'light' | 'dark'
  module?: Module
}

const ITEM =
  'flex w-full items-center gap-[11px] px-5 py-[0.7rem] text-left text-sm text-fg transition-colors duration-fast hover:bg-muted'
const PONTO = 'h-[9px] w-[9px] shrink-0 rounded-full'

export function Menu({ mode = 'light', module }: MenuProps) {
  const [opened, setOpened] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const fecharRef = useRef<HTMLButtonElement>(null)

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

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        aria-label="Menu"
        aria-expanded={opened}
        data-module={module}
        onClick={() => setOpened(true)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          mode === 'dark'
            ? 'bg-on-dark/10 text-on-dark hover:bg-on-dark/[.18]'
            : module
              ? 'border border-accent-deep/10 bg-accent/40 text-accent-fg hover:bg-accent/80'
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

        <Link
          href="/metodologia"
          className={ITEM}
          onClick={() => setOpened(false)}
        >
          <span aria-hidden className={cn(PONTO, 'bg-surface-deep')} />
          Metodologia
        </Link>
        <Link href="/sobre" className={ITEM} onClick={() => setOpened(false)}>
          <span aria-hidden className={cn(PONTO, 'bg-surface-deep')} />
          Sobre
        </Link>

        <div className="px-5 pb-[0.4rem] pt-4 text-xs font-bold uppercase tracking-[0.8px] text-fg-muted">
          Módulos
        </div>

        {MODULES.map((module) => (
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
        ))}
      </aside>
    </>
  )
}
