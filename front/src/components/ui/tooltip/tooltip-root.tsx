import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { CircleQuestionMark } from 'lucide-react'
import { ReactNode } from 'react'

export interface Props {
  children: ReactNode
  className?: string 
  size?: 'sm' | 'md'
  module?: Module
}

export function TooltipRoot({
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
