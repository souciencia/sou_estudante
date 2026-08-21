// components/atoms/typo.tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

type TypographyVariant = 'title' | 'normal' | 'mute' | 'accent'
type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
type TypographyTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span'

interface TypoProps extends HTMLAttributes<HTMLElement> {
  v?: TypographyVariant
  s?: TypographySize
  t?: TypographyTag
  children: ReactNode
}

const variantStyles: Record<TypographyVariant, string> = {
  title: 'text-[var(--text-title)] font-bold',
  normal: 'text-[var(--text-normal)]',
  mute: 'text-[var(--text-mute)] cursor-not-allowed',
  accent: 'text-[var(--text-accent)]',
}

const sizeStyles: Record<TypographySize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
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

// <Typo tag="h2" size="xl" variant="title">
// <Typo size="sm"
