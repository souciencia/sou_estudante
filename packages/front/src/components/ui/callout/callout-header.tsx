import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CalloutHeader = ({
  children,
  className,
  ...props
}: CalloutHeaderProps) => {
  return (
    <div className={cn('flex items-start gap-3.5', className)} {...props}>
      {children}
    </div>
  )
}
