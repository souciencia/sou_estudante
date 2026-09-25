'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface MenuProps {
  mode?: 'light' | 'dark'
}

const MODULOS = [
  {
    modulo: 'm1',
    href: '/cursos/',
    rotulo: 'Escolher curso',
    cor: 'bg-m1-accent',
  },
  {
    modulo: 'm2',
    href: '/ingresso/',
    rotulo: 'Como ingressar',
    cor: 'bg-m2-accent',
  },
  {
    modulo: 'm3',
    href: '/permanencia/',
    rotulo: 'Como permanecer',
    cor: 'bg-m3-accent',
  },
  {
    modulo: 'm4',
    href: '/instituicao/',
    rotulo: 'Conhecer instituição',
    cor: 'bg-m4-accent',
  },
  {
    modulo: 'm5',
    href: '/comparar/',
    rotulo: 'Comparar cursos',
    cor: 'bg-m5-accent',
  },
]

const ITEM =
  'flex w-full items-center gap-[11px] px-5 py-[0.7rem] text-left text-sm text-text transition-colors duration-fast hover:bg-surface-alt'
const PONTO = 'h-[9px] w-[9px] shrink-0 rounded-full'

export default function Menu({ mode = 'light' }: MenuProps) {
  const [opened, setOpened] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const fecharRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!opened) return
    document.body.style.overflow = 'hidden'
    fecharRef.current?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
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

    document.addEventListener('keydown', aoTeclar)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', aoTeclar)
      botaoRef.current?.focus()
    }
  }, [opened])

  return (
    <>
      <button
        ref={botaoRef}
        aria-label="Menu"
        aria-expanded={opened}
        onClick={() => setOpened(true)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${
          mode === 'dark'
            ? 'bg-white/10 text-white hover:bg-white/[.18]'
            : 'bg-plum-100 hover:bg-plum-100/70'
        }`}
      >
        <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden>
          <path
            d="M2 4H14M2 8H14M2 12H14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        aria-hidden
        onClick={() => setOpened(false)}
        className={`fixed inset-0 z-[1200] bg-navy-900/50 transition-opacity duration-cruise ${
          opened ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="nav-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!opened}
        className={`fixed inset-y-0 right-0 z-[1210] flex w-[280px] max-w-[84vw] flex-col overflow-y-auto bg-surface shadow-[-12px_0_40px_color-mix(in_srgb,var(--color-navy-900)_25%,transparent)] transition-transform duration-cruise ease-tide ${
          opened ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-plum-100 px-5 py-[1.1rem]">
          <span className="font-display text-[1.05rem] font-semibold text-text">
            SoU_Estudante
          </span>
          <button
            ref={fecharRef}
            type="button"
            aria-label="Fechar"
            onClick={() => setOpened(false)}
            className="p-1 text-text-muted transition-colors duration-fast hover:text-text"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              width="16"
              height="16"
              aria-hidden
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
          <span aria-hidden className={`${PONTO} bg-text`} />
          Início
        </Link>

        <div className={`${ITEM} cursor-default hover:bg-transparent`}>
          <span aria-hidden className={`${PONTO} bg-plum-100`} />
          Metodologia
          <span className="ml-auto rounded-[20px] bg-site-background px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.4px] text-text-muted">
            em breve
          </span>
        </div>
        <div className={`${ITEM} cursor-default hover:bg-transparent`}>
          <span aria-hidden className={`${PONTO} bg-plum-100`} />
          Sobre
          <span className="ml-auto rounded-[20px] bg-site-background px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.4px] text-text-muted">
            em breve
          </span>
        </div>

        <div className="px-5 pb-[0.4rem] pt-4 text-[9px] font-bold uppercase tracking-[0.8px] text-text-muted">
          Módulos
        </div>

        {MODULOS.map((m) => (
          <Link
            key={m.modulo}
            href={m.href}
            className={ITEM}
            onClick={() => setOpened(false)}
          >
            <span aria-hidden className={`${PONTO} ${m.cor}`} />
            {m.rotulo}
          </Link>
        ))}
      </aside>
    </>
  )
}
