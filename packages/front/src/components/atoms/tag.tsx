import type { HTMLAttributes } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  label: string
  module: Module
}

export const Tag = ({ label, module, className, ...props }: TagProps) => {
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
