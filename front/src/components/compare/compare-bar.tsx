'use client'

import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { MAX_COMPARE, useCompareCursos } from './compare-provider'
import { Button } from '../ui/button/button'

interface CompareBarProps {
  module?: Module
}

export function CompareBar({ module }: CompareBarProps) {
  const { ids } = useCompareCursos()

  if (ids.length < 2) {
    return null
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-panel bg-m2-accent/20 p-4">
      <Typo v="accent" s="sm" t="p" className="text-m2-deep font-bold">
        {ids.length} de {MAX_COMPARE} cursos selecionados para comparar
      </Typo>

      <Button v='solid' href="/comparar" className='text-m2-deep'>
        {ids.length > 0 ? `Comparar (${ids.length})` : 'Comparar'}
      </Button>
    </div>
  )
}
