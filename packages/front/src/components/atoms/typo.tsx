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
  title: 'font-title-protagonist font-bold',
  normal: '',
  mute: 'text-fg-muted cursor-not-allowed',
  accent: 'text-accent-deep',
}

const sizeStyles: Record<TypographySize, string> = {
  xs: 'text-coadjuvant-sm',
  sm: 'text-coadjuvant',
  md: 'text-protagonist',
  lg: 'text-coadjuvant-lg',
  xl: 'text-protagonist-lg',
  '2xl': 'text-protagonist-lg',
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
