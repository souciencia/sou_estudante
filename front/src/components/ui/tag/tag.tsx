import type { HTMLAttributes, ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  label: string
  module?: Module
  icon?: ReactNode
  source?: string
  variant?: 'module' | 'curso' | 'destak' | 'none'
}

export const Tag = ({
  label,
  module,
  icon,
  source,
  className,
  variant = 'none',
  ...props
}: TagProps) => {
  const content = (
    <>
      {icon}
      {label}
      {source && <span className="font-normal text-2xs">· {source}</span>}
    </>
  )

  const colors = {
    module: 'bg-accent-tag text-accent-deep',
    curso: 'bg-m2-tag/50 text-fg-tag',
    blue: 'bg-sky-100 text-sky-800',
    destak: 'bg-green-100 text-green-800',
    none: 'bg-gray-300 text-fg-muted',
  }

  return (
    <span
      data-module={module}
      {...props}
      className={cn(
        'inline-flex items-center gap-1 rounded-r-xs pl-4 pr-2 py-1 mr-1 ',
        'font-semibold font-sans text-fg-muted text-xs',
        '[clip-path:polygon(7px_0%,100%_0%,100%_100%,7px_100%,0%_50%)]',
        colors[variant],
        className,
      )}
    >
      <span 
        data-module={module} 
        className={cn(
          'size-1.5 rounded-full -translate-x-1.5',
          'bg-fg/15'
          )}
        >
      </span>
      {content}
    </span>
  )
}
