import type { InputHTMLAttributes } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  module?: Module
}

export const Checkbox = ({ className, module, ...props }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      data-module={module}
      className={cn(
        'size-5 shrink-0 cursor-pointer appearance-none rounded-md',
        'border border-card-border bg-card-surface transition-colors',
        'hover:border-fg-muted',
        'checked:border-accent checked:bg-accent',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'after:block after:h-[60%] after:w-[60%] after:content-[""]',
        'after:mx-auto after:my-[20%] after:hidden after:bg-accent-fg',
        'checked:after:block',
        'after:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)]',
        className,
      )}
      {...props}
    />
  )
}
