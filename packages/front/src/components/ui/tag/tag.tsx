import type { HTMLAttributes } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  label: string
  module?: Module
}

export const Tag = ({ label, module, className, ...props }: TagProps) => {
  if(module) {
    return (
      <span
        data-module={module}
        {...props}
        className={cn(
          'mr-1 rounded-2xl border border-accent/30 px-2 py-1',
          'bg-accent/10 font-coadjuvant text-accent-deep text-coadjuvant-xs font-bold',
          'transition duration-300',
          className,
        )}
      >
        {label}
      </span>
    )
  }

    return (
      <span
        {...props}
        className={cn(
          'mr-1 rounded-2xl border border-plum-100 px-2 py-1',
          'bg-site-background font-coadjuvant text-text-muted text-coadjuvant-xs font-semibold',
          'transition duration-300',
          className,
        )}
      >
        {label}
      </span>
    )
}
