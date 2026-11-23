'use client'

import { Check } from 'lucide-react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useCompareCursos } from './compare-provider'

export interface CompareCourseLinkProps {
  /** Id (sequencial) do curso a incluir/remover da comparação. */
  courseId: number
  module?: Module
  className?: string
}

/**
 * Link do rodapé do card de curso que adiciona/remove o curso da comparação:
 * o rótulo alterna entre "Comparar" e "Adicionado à comparação".
 */
export function CompareCourseLink({
  courseId,
  module = '5',
  className,
}: CompareCourseLinkProps) {
  const { isSelected, toggle } = useCompareCursos()
  const id = String(courseId)
  const selected = isSelected(id)

  return (
    <button
      type="button"
      data-module={module}
      aria-pressed={selected}
      onClick={() => toggle(id)}
      className={cn(
        'flex flex-wrap gap-y-1 my-3',
        'font-sans text-xs font-bold',
        'hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        selected ? 'text-ok' : 'text-accent-deep',
        className,
      )}
    >
      {selected ? 'Adicionado à comparação' : 'Comparar'}
      {selected && <Check className="size-3" aria-hidden="true" />}
    </button>
  )
}
