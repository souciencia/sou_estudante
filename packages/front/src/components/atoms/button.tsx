import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'chip' | 'solid' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  module?: Module
  active?: boolean
  v?: ButtonVariant
}

const BASE =
  'inline-flex items-center gap-1 rounded-full border px-4 py-1 font-coadjuvant text-coadjuvant font-bold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep'

const variantStyles = (v: ButtonVariant, active: boolean) => {
  switch (v) {
    case 'solid':
      return 'border-accent bg-accent text-accent-fg shadow-md hover:bg-accent/90'
    case 'outline':
      return 'border-accent bg-transparent text-accent-deep hover:bg-accent/10'
    default:
      return active
        ? 'border-accent/70 bg-accent/10 text-accent-fg shadow-md'
        : 'border-transparent bg-muted text-fg-muted shadow-md'
  }
}

export const Button = ({
  children,
  module,
  active = true,
  v = 'chip',
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      data-module={module}
      {...props}
      className={cn(BASE, variantStyles(v, active), className)}
    >
      {children}
    </button>
  )
}
