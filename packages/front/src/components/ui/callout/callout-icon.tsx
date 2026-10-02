import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutIconProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CalloutIcon = ({
  children,
  className,
  ...props
}: CalloutIconProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-callout-accent/15 text-callout-accent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
