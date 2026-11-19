'use client'

import { Check } from 'lucide-react'
import { SextantIcon } from '@/components/ui/route/icons/sextant-icon'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useCompareCursos } from './compare-provider'

export interface CompareCourseButtonProps {
  /** Id (sequencial) do curso a incluir/remover da comparação. */
  courseId: number
  module?: Module
  className?: string
}

/**
 * Botão de inclusão do curso na comparação, no formato das rotas inline do
 * perfil: o rótulo alterna entre "Comparar" e "Na comparação".
 */
export function CompareCourseButton({
  courseId,
  module = '5',
  className,
}: CompareCourseButtonProps) {
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
        'group flex items-center gap-4 rounded-card border px-4 py-4 text-left',
        'transition-transform hover:-translate-y-0.5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        selected
          ? 'border-ok bg-ok-surface'
          : 'border-border-primary bg-surface-lv2',
        className,
      )}
    >
      <SextantIcon className="size-9 shrink-0" />
      <span className="flex flex-1 flex-col">
        <span className="font-sans font-bold text-sm">
          {selected ? 'Na comparação' : 'Comparar'}
        </span>
        <span className="text-xs text-fg-muted">
          Selecione este curso para poder vê-lo na página de comparação mais
          tarde
        </span>
      </span>
      {selected && <Check className="size-4 text-ok" aria-hidden="true" />}
    </button>
  )
}
