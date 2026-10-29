'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { useCompareCursos } from './compare-provider'

export type CompareActionsVariant = 'neutral' | 'accent'

interface CompareActionsProps {
  module?: Module
  variant: CompareActionsVariant
  className?: string
}

const VARIANTS: Record<
  CompareActionsVariant,
  { container: string; link: string; button: string }
> = {
  neutral: {
    container: 'border border-border-primary bg-surface-lv2',
    link: 'text-fg',
    button: 'text-fg-muted hover:bg-muted hover:text-fg',
  },
  accent: {
    container: 'bg-m5-accent',
    link: 'text-white',
    button: 'text-white',
  },
  
}

/**
 * Par de ações da comparação: o link "Comparar (N)" que leva a /comparar e o
 * botão de limpar a seleção, sempre na mesma estrutura (pill com o botão à
 * direita). O número e a ação de limpar vêm do `CompareProvider`. A variante
 * muda apenas as cores: `neutral` (cabeçalho) ou `accent` (barra de busca).
 */
export function CompareActions({
  module,
  variant,
  className,
}: CompareActionsProps) {
  const { ids, clear } = useCompareCursos()
  const colors = VARIANTS[variant]

  return (
    <div
      data-module={module}
      className={cn(
        'flex items-center gap-1 rounded-control py-1 pl-[1.15rem] pr-1',
        colors.container,
        className,
      )}
    >
      <Link
        href="/comparar"
        className={cn('text-xs font-semibold', colors.link)}
      >
        Comparar ({ids.length})
      </Link>
      <button
        type="button"
        onClick={clear}
        aria-label="Limpar comparação"
        className={cn(
          'flex size-6 cursor-pointer items-center justify-center rounded-full transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          colors.button,
        )}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
