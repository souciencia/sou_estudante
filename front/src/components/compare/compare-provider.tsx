'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

/** Limite de cursos selecionáveis para comparação. */
export const MAX_COMPARE = 5

export interface CompareCursos {
  /** Ids (sequenciais) dos cursos selecionados, na ordem de seleção. */
  ids: string[]
  /** Adiciona ou remove um curso da seleção; respeita `MAX_COMPARE`. */
  toggle: (id: string) => void
  isSelected: (id: string) => boolean
  clear: () => void
}

const CompareContext = createContext<CompareCursos | null>(null)

/**
 * Estado global da seleção de cursos para comparação. Vive em memória
 * (React Context) para sobreviver à navegação entre /cursos e /comparar.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id)
      }
      if (current.length >= MAX_COMPARE) {
        return current
      }
      return [...current, id]
    })
  }, [])

  const isSelected = useCallback((id: string) => ids.includes(id), [ids])

  const clear = useCallback(() => setIds([]), [])

  const value = useMemo(
    () => ({ ids, toggle, isSelected, clear }),
    [ids, toggle, isSelected, clear],
  )

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  )
}

export function useCompareCursos(): CompareCursos {
  const context = useContext(CompareContext)
  if (context === null) {
    throw new Error('useCompareCursos must be used within <CompareProvider>.')
  }
  return context
}
