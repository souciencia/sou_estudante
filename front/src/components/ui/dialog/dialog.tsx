'use client'

import { X } from 'lucide-react'
import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

export interface DialogProps {
  open: boolean
  onClose: () => void
  /** Id do elemento visível que nomeia o diálogo (ex.: o título do conteúdo). */
  labelledBy: string
  /** Id do próprio diálogo, referenciado por `aria-controls` no gatilho. */
  id?: string
  /** Rótulo acessível do botão de fechar. */
  closeLabel?: string
  children: ReactNode
  className?: string
}

/**
 * Overlay de diálogo modal centrado: bloqueia o scroll do fundo, fecha por
 * Esc/toque no véu/fechar e devolve o foco ao gatilho. Fica sempre montado e
 * usa `inert` quando fechado (mesmo padrão do `BottomSheet`), evitando portal e
 * dependências externas.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  id,
  closeLabel = 'Fechar',
  children,
  className,
}: DialogProps) {
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
          'fixed left-1/2 top-1/2 z-[1310] max-h-[85dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-surface-lv1 shadow-[0_24px_60px_color-mix(in_srgb,var(--color-navy-900)_30%,transparent)] transition-all duration-cruise ease-tide',
          open
            ? 'scale-100 opacity-100'
            : 'pointer-events-none scale-[0.98] opacity-0',
          className,
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-end rounded-t-card bg-surface-lv1 p-2">
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className={cn(
              'flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-primary bg-surface-lv1 text-fg transition-colors hover:border-accent-deep hover:text-accent-deep',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
            )}
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-1">{children}</div>
      </section>
    </>
  )
}
