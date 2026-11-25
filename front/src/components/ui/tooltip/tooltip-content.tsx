'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useTooltipContext } from './tooltip-context'

export interface TooltipContentProps {
  children: ReactNode
  className?: string
  /** Nome acessível do botão de fechar. */
  closeLabel?: string
}

export function TooltipContent({
  children,
  className,
  closeLabel = 'Fechar',
}: TooltipContentProps) {
  const { open, size, contentId, closeRef, closeTooltip } =
    useTooltipContext('Tooltip.Content')

  if (!open) return null

  const isSmall = size === 'sm'

  return (
    <div
      id={contentId}
      className={cn(
        'absolute left-0 top-full z-20 mt-2 w-[calc(100vw_-_2rem)] max-w-[700px] rounded-panel border border-border-primary bg-surface-lv2 p-4 pr-9 text-fg shadow-lg',
        className,
      )}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label={closeLabel}
        onClick={closeTooltip}
        className={cn(
          'absolute right-2 top-2 inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-fg-muted',
          'transition-colors duration-fast hover:text-accent-deep',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        )}
      >
        <X aria-hidden="true" className="size-4 font-black" />
      </button>

      <div className={cn('leading-relaxed', isSmall ? 'text-xs' : 'text-sm')}>
        {children}
      </div>
    </div>
  )
}
