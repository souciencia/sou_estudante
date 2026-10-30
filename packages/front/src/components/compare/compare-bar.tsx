'use client'

import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { CompareActions } from './compare-actions'
import { MAX_COMPARE, useCompareCursos } from './compare-provider'

interface CompareBarProps {
  module?: Module
}

/**
 * CTA de comparação exibido na busca de cursos quando o modo de comparação
 * está ativo e há 2+ cursos selecionados: resume a seleção e leva a /comparar.
 */
export function CompareBar({ module }: CompareBarProps) {
  const { ids, isComparing } = useCompareCursos()

  if (!isComparing || ids.length < 2) {
    return null
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-panel border border-accent/40 bg-accent/10 p-4">
      <Typo v="accent" s="sm" t="p">
        {ids.length} de {MAX_COMPARE} cursos selecionados para comparar
      </Typo>
      <CompareActions module={module} />
    </div>
  )
}
