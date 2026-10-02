import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CalloutVariant = 'info' | 'future'

export interface CalloutRootProps extends HTMLAttributes<HTMLDivElement> {
  v?: CalloutVariant
  children?: ReactNode
}

const variantStyles: Record<CalloutVariant, string> = {
  info: 'border border-callout-accent/40 text-fg-protagonist',
  future:
    'border-2 border-dashed border-callout-accent text-callout-accent-deep',
}

export const CalloutRoot = ({
  v = 'info',
  children,
  className,
  ...props
}: CalloutRootProps) => {
  return (
    <div
      role="note"
      data-variant={v}
      className={cn(
        'callout rounded-callout bg-callout-surface px-5 py-4 font-protagonist text-protagonist leading-relaxed',
        variantStyles[v],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
