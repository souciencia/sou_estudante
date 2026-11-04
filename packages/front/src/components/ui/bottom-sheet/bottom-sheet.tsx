'use client'

import { X } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Id do elemento visível que nomeia o diálogo (ex.: o título "Filtros"). */
  labelledBy: string
  /** Id do próprio diálogo, referenciado por `aria-controls` no gatilho. */
  id?: string
  children: ReactNode
  className?: string
}

/**
 * Overlay de bottom sheet: desliza de baixo, bloqueia o scroll do fundo,
 * fecha por Esc/toque no véu/fechar e devolve o foco ao gatilho. Fica sempre
 * montado e usa `inert` quando fechado (mesmo padrão do `Menu`), evitando
 * portal e dependências externas.
 */
export function BottomSheet({
  open,
  onClose,
  labelledBy,
  id,
  children,
  className,
}: BottomSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (!focusable || focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      restoreFocusRef.current?.focus()
    }
  }, [open, onClose])

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[1300] bg-navy-900/50 transition-opacity duration-cruise',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <section
        id={id}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        inert={!open}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[1310] mx-auto flex max-h-[85dvh] w-full max-w-[34rem] flex-col overflow-y-auto rounded-t-card bg-surface-lv1 shadow-[0_-12px_40px_color-mix(in_srgb,var(--color-navy-900)_25%,transparent)] transition-transform duration-cruise ease-tide',
          open ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
      >
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center rounded-t-card bg-surface-lv1 px-4 pb-2 pt-3">
          <span aria-hidden="true" />
          <span
            aria-hidden="true"
            className="h-1.5 w-10 rounded-full bg-border-border-primary"
          />
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar filtros"
            onClick={onClose}
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center justify-self-end rounded-full border border-border-primary bg-surface-lv1 text-fg transition-colors hover:border-accent-deep hover:text-accent-deep',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
            )}
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        {children}
      </section>
    </>
  )
}
