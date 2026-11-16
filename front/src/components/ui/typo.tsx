import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type TypographyVariant = 'title' | 'normal' | 'mute' | 'accent'
type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type TypographyTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span'

interface TypoProps extends HTMLAttributes<HTMLElement> {
  v?: TypographyVariant
  s?: TypographySize
  t?: TypographyTag
  children: ReactNode
}

const variantStyles: Record<TypographyVariant, string> = {
  title: 'font-display font-bold',
  normal: '',
  mute: 'text-fg-muted',
  accent: 'text-accent-deep',
}

const sizeStyles: Record<TypographySize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
  xl: 'text-xl',
}

export const Typo = ({
  v = 'normal',
  s = 'md',
  t: Tag = 'span',
  children,
  className,
  ...props
}: TypoProps) => {
  return (
    <Tag className={cn(variantStyles[v], sizeStyles[s], className)} {...props}>
      {children}
    </Tag>
  )
}
