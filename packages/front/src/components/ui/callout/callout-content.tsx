import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CalloutContent = ({
  children,
  className,
  ...props
}: CalloutContentProps) => {
  return (
    <div
      className={cn(
        'mt-3 flex flex-col gap-2.5 border-l-2 border-callout-accent/50 pl-3.5 text-protagonist-sm leading-relaxed',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
