'use client'

import { useId } from 'react'
import { Switch } from '@/components/ui/switch/switch'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { useCompareCursos } from './compare-provider'

interface CompareToggleProps {
  module?: Module
}

/**
 * Switch "Comparar" da busca de cursos: liga o modo de comparação, que
 * revela os checkboxes de seleção nos cards de resultado.
 */
export function CompareToggle({ module }: CompareToggleProps) {
  const { isComparing, setComparing } = useCompareCursos()
  const labelId = useId()

  return (
    <div className="flex items-center gap-2">
      <Typo s="sm" t="span" id={labelId} className="text-fg">
        Comparar
      </Typo>
      <Switch
        size="sm"
        module={module}
        checked={isComparing}
        aria-labelledby={labelId}
        onCheckedChange={setComparing}
      />
    </div>
  )
}
