'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useCompareCursos } from './compare-provider'

interface CompareActionsProps {
  module?: Module
  className?: string
}

/**
 * Par de ações da comparação: o link "Comparar (N)" que leva a /comparar e o
 * botão de limpar a seleção, sempre na mesma estrutura (pill com o botão à
 * direita). O número e a ação de limpar vêm do `CompareProvider`.
 */
export function CompareActions({ module, className }: CompareActionsProps) {
  const { ids, clear } = useCompareCursos()

  return (
    <div
      data-module={module}
      className={cn(
        'flex items-center gap-1 rounded-full border border-accent bg-accent/20 py-1 pl-[1.15rem] pr-1',
        className,
      )}
    >
      <Link href="/comparar" className="text-xs font-semibold text-accent-deep">
        {ids.length > 0 ? `Comparar (${ids.length})` : 'Comparar'}
      </Link>
      <button
        type="button"
        onClick={clear}
        aria-label="Limpar comparação"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-accent-deep transition-colors duration-fast hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
