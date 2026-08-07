import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'
import { StringifyOptions } from 'vitest/internal/browser'

interface Props {
  v?: 'prev' | 'full'
  title?: string
  subtitle?: string
  children?: ReactNode
  className?: string
}

export const CardHeader = ({
  v = 'prev',
  title,
  subtitle,
  children,
  className = '',
}: Props) => {
  const variants = {
    prev: '',
    full: 'bg-gradient-to-r from-green-400 to-green-100',
  }

  return (
    <div className={`flex w-full ${variants[v]} ${className}`}>
      {children}
      <div>
        <h4 className="font-sans font-bold inline-block px-2 text-card-title">
          {title}
        </h4>
        <h5 className={cn(`font-sans font-bold text-fg-muted px-2`)}>
          {subtitle}
        </h5>
      </div>
    </div>
  )
}
