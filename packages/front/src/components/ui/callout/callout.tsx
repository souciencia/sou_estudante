import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CalloutVariant = 'info' | 'future'

interface CalloutProps {
  v?: CalloutVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border border-enade-warn/30 bg-enade-warn-surface/50 text-enade-warn',
  future: 'border-2 border-dashed border-accent bg-accent/10 text-accent-deep',
}

export const Callout = ({ v = 'info', children, className }: CalloutProps) => {
  return (
    <div
      className={cn(
        'rounded-[10px] p-3 font-protagonist text-xs leading-relaxed',
        variantStyles[v],
        className,
      )}
    >
      {children}
    </div>
  )
}
