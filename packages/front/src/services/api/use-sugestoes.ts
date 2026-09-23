// src/services/api/use-sugestoes.ts
'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG } from './config'

export interface UseSugestoesReturn {
  sugestoes: string[]
  isLoading: boolean
}

/**
 * Hook de autocomplete genérico.
 * @param termo - Texto digitado
 * @param fetcher - Função de domínio que retorna as sugestões (cursos, IES, ...)
 * @param minChars - Mínimo de caracteres para consultar a API
 */
export function useSugestoes(
  termo: string,
  fetcher: (termo: string) => Promise<string[]>,
  minChars: number = API_CONFIG.SUGGEST_MIN_CHARS,
): UseSugestoesReturn {
  const normalized = termo.trim()

  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (normalized.length < minChars) {
      setSugestoes((prev) => (prev.length > 0 ? [] : prev))
      setIsLoading(false)
      return
    }

    let isCurrent = true
    setSugestoes([])
    setIsLoading(true)

    fetcher(normalized)
      .then((items) => {
        if (!isCurrent) return
        setSugestoes(items)
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [normalized, fetcher, minChars])

  return { sugestoes, isLoading }
}
