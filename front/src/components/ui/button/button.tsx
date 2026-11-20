import Link from 'next/link'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export type ButtonVariant = 'chip' | 'solid' | 'outline' | 'translucid'
export type ButtonSize = 'normal' | 'big'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  children: ReactNode
  module?: Module
  active?: boolean
  v?: ButtonVariant
  s?: ButtonSize
  /** Quando presente, renderiza um link em vez de um botão. */
  href?: string
}

const variantStyles = (v: ButtonVariant, active: boolean) => {
  switch (v) {
    case 'solid':
      return 'border-accent bg-accent text-fg shadow-md hover:bg-accent/90'
    case 'outline':
      return 'border-accent bg-transparent text-accent-deep hover:bg-accent/10'
    case 'translucid':
      return 'border-on-dark bg-on-dark/[.08] text-on-dark hover:bg-on-dark/[.16]'
      default:
      return active
        ? 'border-accent/70 bg-accent/10 text-accent-fg'
        : 'border-transparent bg-muted text-fg-muted'
  }
}

const sizes = (s: ButtonSize) => {
    switch (s) {
    case 'normal':
      return 'px-4 py-1'
    case 'big':
      return 'px-5 py-3'
    default:
      return 'px-4 py-1'
  }
}

export const Button = ({
  children,
  module,
  active = false,
  v = 'chip',
  s = 'normal',
  href,
  className,
  ...props
}: ButtonProps) => {
  const classes = cn(
    'inline-flex cursor-pointer items-center gap-1 rounded-full border px-4 py-1',
    'font-sans text-sm font-semibold tracking-wide',
    'transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
    variantStyles(v, active),
    sizes(s),
    className,
  )

  if (href) {
    return (
      <Link
        href={href}
        data-module={module}
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type="button" data-module={module} className={classes} {...props}>
      {children}
    </button>
  )
}
