import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutHeaderContentProps
  extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CalloutHeaderContent = ({
  children,
  className,
  ...props
}: CalloutHeaderContentProps) => {
  return (
    <div className={cn('flex flex-col gap-0.5', className)} {...props}>
      {children}
    </div>
  )
}
