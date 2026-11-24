'use client'

import { useId } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { Switch } from '../ui/switch/switch'
import { useCompareCursos } from './compare-provider'

export interface CompareCourseLinkProps {
  /** Id (sequencial) do curso a incluir/remover da comparação. */
  courseId: number
  module?: Module
  className?: string
}

export function CompareCourseLink({
  courseId,
  module,
  className,
}: CompareCourseLinkProps) {
  const { isSelected, toggle } = useCompareCursos()
  const id = String(courseId)
  const selected = isSelected(id)
  const labelId = useId()
  const label = selected ? 'Incluído na comparação' : 'Incluir na comparação'

  return (
    <div
      data-module={module}
      className={cn('flex items-center gap-2', className)}
    >
      <Switch
        checked={selected}
        onCheckedChange={() => toggle(id)}
        module={module}
        aria-labelledby={labelId}
        size='sm'
      />
      <span id={labelId} className="font-sans text-sm text-fg-muted">
        {label}
      </span>
    </div>
  )
}
