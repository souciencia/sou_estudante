import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type CalloutVariant = 'blue' | 'gold' | 'module'

export interface CalloutRootProps extends HTMLAttributes<HTMLDivElement> {
  v?: CalloutVariant
  children?: ReactNode
}

export const CalloutRoot = ({
  v = 'blue',
  children,
  className,
  ...props
}: CalloutRootProps) => {
  return (
    <div
      role="note"
      data-variant={v}
      className={cn(
        'callout rounded-callout bg-callout-surface p-3 px-4 font-sans text-xs leading-[1.6]',
        'border border-callout-accent-deep/30 text-callout-accent-deep',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
