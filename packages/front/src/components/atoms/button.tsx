import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  module?: '1' | '2' | '3' | '4' | '5'
  active?: boolean
  icon?: ReactNode
}

export const Button = ({
  children,
  module,
  active,
  className,
  icon,
  ...props
}: ButtonProps) => {
  return (
    <button
      data-module={`${module}`}
      {...props}
      className={cn(
        `${active ? 'bg-button-surface' : 'bg-button-surface-muted'}`,
        `${active ? 'text-button-fg' : 'text-button-fg-muted'}`,
        'border font-bold mr-2 px-4 py-1 rounded-full text-sm ',
        'shadow-md transition duration-300',
        `${className || ''}`,
      )}
    >
      {children}
    </button>
  )
}
