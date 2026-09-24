import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CalloutVariant = 'info' | 'future'

interface CalloutProps {
  v?: CalloutVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border border-enade-warn/40 bg-enade-warn-surface text-fg-protagonist',
  future: 'border-2 border-dashed border-accent bg-accent/10 text-accent-deep',
}

export const Callout = ({ v = 'info', children, className }: CalloutProps) => {
  return (
    <div
      className={cn(
        'rounded-[18px] px-5 py-4 font-protagonist text-protagonist leading-relaxed',
        variantStyles[v],
        className,
      )}
    >
      {children}
    </div>
  )
}
