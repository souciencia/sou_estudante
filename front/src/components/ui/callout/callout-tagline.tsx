import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutTaglineProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
}

export const CalloutTagline = ({
  children,
  className,
  ...props
}: CalloutTaglineProps) => {
  return (
    <span
      className={cn(
        'callout-tagline font-bold text-xs uppercase tracking-wider text-callout-accent-deep',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
