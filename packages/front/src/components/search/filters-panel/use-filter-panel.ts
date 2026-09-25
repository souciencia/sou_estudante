'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export interface UseFilterPanelReturn {
  /** Valores ativos de uma chave na URL (ex.: uf=SP,RJ -> ['SP','RJ']). */
  getActiveValues: (key: string) => string[]
  /** Liga/desliga um valor de uma chave e volta para a página 1. */
  toggle: (key: string, value: string) => void
}

/**
 * Estado de filtros multipropósito: lê os valores ativos da URL e alterna
 * valores, delegando a escrita da URL ao `updateParams` do hook de busca.
 */
export function useFilterPanel(
  updateParams: (params: Record<string, string | null>) => void,
): UseFilterPanelReturn {
  const searchParams = useSearchParams()

  const getActiveValues = useCallback(
    (key: string): string[] => {
      const raw = searchParams?.get(key)
      if (!raw) return []
      return raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    },
    [searchParams],
  )

  const toggle = useCallback(
    (key: string, value: string) => {
      const activeValues = getActiveValues(key)
      const exists = activeValues.includes(value)
      const newValues = exists
        ? activeValues.filter((item) => item !== value)
        : [...activeValues, value]

      updateParams({
        [key]: newValues.length > 0 ? newValues.join(',') : null,
        page: '1',
      })
    },
    [getActiveValues, updateParams],
  )

  return { getActiveValues, toggle }
}
