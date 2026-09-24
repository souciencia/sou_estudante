import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { CardContext } from './card-context'

interface Props {
  v?: 'prev' | 'full'
  module?: Module
  children: ReactNode
  className?: string
}

export const CardRoot = ({
  children,
  className,
  module,
  v = 'prev',
}: Props) => {
  const variants = {
    prev: 'w-full',
    full: 'bg-gradient-to-r from-accent/40 to-accent/10',
  }

  return (
    <CardContext.Provider value={module ?? '1'}>
      <div
        data-module={module}
        className={cn(
          'rounded-card border border-card-border px-6 py-4 font-protagonist text-fg-protagonist shadow',
          variants[v],
          className,
        )}
      >
        {children}
      </div>
    </CardContext.Provider>
  )
}
