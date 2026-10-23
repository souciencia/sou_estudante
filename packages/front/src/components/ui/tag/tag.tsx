import type { HTMLAttributes, ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  label: string
  module?: Module
  icon?: ReactNode
  source?: string
  variant?: 'module' | 'curso' | 'blue' | 'green' | 'none'
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
    module: 'bg-accent/20 border-accent/80 text-accent-deep',
    curso: 'bg-tag-curso-surface border-tag-curso-border text-tag-curso-deep',
    blue: 'bg-sky-100 border-sky-600 text-sky-800',
    green: 'bg-green-100 border-green-600 text-green-800',
    none: 'bg-surface-deep/30 border-border-secondary text-fg-muted',
  }

  return (
    <span
      data-module={module}
      {...props}
      className={cn(
        'mr-1 inline-flex items-center gap-1 rounded-2xl border px-2 py-1',
        'font-semibold font-sans text-fg-muted text-xs',
        'transition duration-300',
        colors[variant],
        className,
      )}
    >
      {content}
    </span>
  )
}
