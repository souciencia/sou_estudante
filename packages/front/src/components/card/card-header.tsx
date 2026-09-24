import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

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
  className,
}: Props) => {
  const variants = {
    prev: '',
    full: 'bg-gradient-to-r from-accent/40 to-accent/10',
  }

  return (
    <div className={cn('flex w-full', variants[v], className)}>
      {children}
      <div>
        <h4 className="inline-block px-2 font-title-protagonist font-bold text-protagonist-lg">
          {title}
        </h4>
        <h5 className="px-2 font-protagonist font-bold text-fg-muted">
          {subtitle}
        </h5>
      </div>
    </div>
  )
}
