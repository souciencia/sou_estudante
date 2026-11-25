import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { CircleQuestionMark } from 'lucide-react'

export interface TooltipProps {
  className?: string 
  size?: 'sm' | 'md'
  module?: Module
}

export function TooltipIcon({
  className,
  size = 'md',
  module,
}: TooltipProps) {

  return (
    <div 
      data-module={module} 
      className={cn(
        'inline-block rounded-full bg-accent-tag/40 p-1',
        'hover:bg-accent transition-colors'
        )}>
    <CircleQuestionMark 
      className={cn(
        'text-accent-deep',
        'hover:text-accent-deep/45'
      )}
      />
    </div>
  )
}
