import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Props {
  v?: 'prev' | 'full'
  children?: ReactNode
  className?: string
}

export const CardHeader = ({ v = 'prev', children, className }: Props) => {
  const variants = {
    prev: '',
    full: 'bg-gradient-to-r from-accent/40 to-accent/10',
  }

  return (
    <div className={cn('flex w-full', variants[v], className)}>
      {children}
    </div>
  )
}
