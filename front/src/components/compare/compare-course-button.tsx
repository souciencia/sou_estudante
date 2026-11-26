'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SextantIcon } from '@/components/ui/route/icons/sextant-icon'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useCompareCursos } from './compare-provider'

export interface CompareCourseButtonProps {
  /** Id (sequencial) do curso a incluir na comparação. */
  courseId: number
  module?: Module
  className?: string
}

/**
 * Botão único do perfil para a comparação: começa como "Adicionar à
 * comparação" e, uma vez incluído, vira o link "Ir para a Comparação".
 */
export function CompareCourseButton({
  courseId,
  module = '5',
  className,
}: CompareCourseButtonProps) {
  const { isSelected, toggle } = useCompareCursos()
  const id = String(courseId)
  const selected = isSelected(id)

  const classes = cn(
    'group flex items-center gap-4 rounded-card border px-4 py-4 text-left',
    'transition-transform hover:-translate-y-0.5',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
    selected
      ? 'border-ok bg-ok-surface'
      : 'border-border-primary bg-surface-lv2',
    className,
  )

  if (selected) {
    return (
      <Link href="/comparar" data-module={module} className={classes}>
        <SextantIcon className="size-9 shrink-0" />
        <span className="flex flex-1 flex-col">
          <span className="font-sans font-bold text-sm">
            Ir para a Comparação
          </span>
          <span className="text-xs text-fg-muted">
            Veja os cursos selecionados lado a lado — Sextante
          </span>
        </span>
        <ArrowRight
          className="size-4 text-fg-muted transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <button
      type="button"
      data-module={module}
      onClick={() => toggle(id)}
      className={classes}
    >
      <SextantIcon className="size-9 shrink-0" />
      <span className="flex flex-1 flex-col">
        <span className="font-sans font-bold text-sm">
          Adicionar à comparação
        </span>
        <span className="text-xs text-fg-muted">
          Selecione este curso para poder vê-lo na página de comparação mais
          tarde
        </span>
      </span>
    </button>
  )
}
