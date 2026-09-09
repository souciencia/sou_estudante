// src/services/api/use-sugestoes-cursos.ts
'use client'

import { useEffect, useState } from 'react'
import { API_CONFIG } from '@/services/api'
import { cursoService } from '@/services/api/curso.service'

export interface UseSugestoesCursosReturn {
  sugestoes: string[]
  isLoading: boolean
}

export function useSugestoesCursos(termo: string): UseSugestoesCursosReturn {
  const normalized = termo.trim()

  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (normalized.length < API_CONFIG.SUGGEST_MIN_CHARS) {
      setSugestoes((prev) => (prev.length > 0 ? [] : prev))
      setIsLoading(false)
      return
    }

    let isCurrent = true
    setSugestoes([])
    setIsLoading(true)

    cursoService
      .sugerirCursos(normalized)
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
  }, [normalized])

  return { sugestoes, isLoading }
}
