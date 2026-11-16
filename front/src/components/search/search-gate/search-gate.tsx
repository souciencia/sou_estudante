'use client'

import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

export interface SearchGateProps {
  /** Nº mínimo de caracteres em `q` para considerar que houve busca. */
  minQueryLength?: number
  /** Conteúdo exibido enquanto nenhuma busca foi realizada. */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Renderiza a área de resultados/filtros somente após uma busca ter sido
 * realizada — ou seja, quando o parâmetro `q` da URL atinge o tamanho mínimo.
 * Agnóstico de domínio: cobre cursos, IES e futuros módulos.
 */
export function SearchGate({
  minQueryLength = 1,
  fallback = null,
  children,
}: SearchGateProps) {
  const searchParams = useSearchParams()
  const query = searchParams?.get('q')?.trim() ?? ''
  const hasSearched = query.length >= minQueryLength

  return hasSearched ? children : fallback
}
