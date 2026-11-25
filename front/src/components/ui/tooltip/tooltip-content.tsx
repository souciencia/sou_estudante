import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { ReactNode } from 'react'

export interface Props {
  children: ReactNode
  className?: string 
  size?: 'sm' | 'md'
  module?: Module
}

export function TooltipContent({
  children, 
  className,
  size = 'md',
  module,
}: Props) {

  return (
    <div data-module={module}>
      {children}
    </div>
  )
}
