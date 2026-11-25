'use client'

import { CircleQuestionMark } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTooltipContext } from './tooltip-context'

export interface TooltipIconProps {
  className?: string
  /** Nome acessível do botão e texto do hover (title). */
  label?: string
}

export function TooltipIcon({
  className,
  label = 'Clique para saber mais',
}: TooltipIconProps) {
  const { open, size, contentId, triggerRef, toggleTooltip } =
    useTooltipContext('Tooltip.Icon')

  const isSmall = size === 'sm'

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={toggleTooltip}
      aria-expanded={open}
      aria-controls={contentId}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center rounded-full bg-accent/10 text-accent-deep',
        'transition-colors duration-fast hover:bg-accent hover:text-accent-fg',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        isSmall ? 'size-6' : 'size-8',
        className,
      )}
    >
      <CircleQuestionMark
        aria-hidden="true"
        className={cn(isSmall ? 'size-4' : 'size-5')}
      />
    </button>
  )
}
