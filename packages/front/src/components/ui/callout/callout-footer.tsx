import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const CalloutFooter = ({
  children,
  className,
  ...props
}: CalloutFooterProps) => {
  return (
    <div
      className={cn(
        'm-3 flex w-full border-t border-callout-accent/50 p-2 text-coadjuvant-xs italic',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
