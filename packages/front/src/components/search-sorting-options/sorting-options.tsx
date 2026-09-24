'use client'

import { Button } from '@/components/button/button'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export interface SortOption {
  label: string
  value: string
}

export interface SortingOptionsProps {
  options: SortOption[]
  onSelect: (value: string) => void
  module?: Module
  className?: string
}

/**
 * Grupo de botões de ordenação agnóstico: recebe as opções e o callback,
 * sem conhecer o endpoint de busca.
 */
export function SortingOptions({
  options,
  onSelect,
  module,
  className,
}: SortingOptionsProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      {options.map((option) => (
        <Button
          key={option.value}
          module={module}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
