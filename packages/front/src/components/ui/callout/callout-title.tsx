import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface CalloutTitleProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  as?: ElementType
}

export const CalloutTitle = ({
  children,
  as: Component = 'p',
  className,
  ...props
}: CalloutTitleProps) => {
  return (
    <Component
      className={cn(
        'font-semibold text-protagonist tracking-tight text-fg-protagonist [&_em]:font-normal [&_em]:italic',
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}
