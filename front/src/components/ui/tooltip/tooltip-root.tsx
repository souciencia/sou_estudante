'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { TooltipContext, type TooltipSize } from './tooltip-context'

export interface TooltipRootProps {
  children: ReactNode
  className?: string
  module?: Module
  size?: TooltipSize
}

export function TooltipRoot({
  children,
  className,
  module,
  size = 'md',
}: TooltipRootProps) {
  const [open, setOpen] = useState(false)
  const contentId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const openTooltip = () => setOpen(true)

  const closeTooltip = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const toggleTooltip = () => {
    if (open) closeTooltip()
    else openTooltip()
  }

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTooltip()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeTooltip])

  return (
    <TooltipContext.Provider
      value={{
        open,
        size,
        contentId,
        triggerRef,
        closeRef,
        openTooltip,
        closeTooltip,
        toggleTooltip,
      }}
    >
      <div
        data-module={module}
        className={cn('relative inline-flex', className)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  )
}
