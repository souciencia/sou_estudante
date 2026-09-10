import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  module?: Module
  active?: boolean
}

export const Button = ({
  children,
  module,
  active = true,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      data-module={module}
      {...props}
      className={cn(
        'mr-2 rounded-full border px-4 py-1 font-coadjuvant text-coadjuvant font-bold',
        'shadow-md transition duration-300 border-accent',
        active
          ? 'border-accent/70 bg-accent/10 text-accent-fg'
          : 'border-transparent bg-muted text-fg-muted',
        className,
      )}
    >
      {children}
    </button>
  )
}
