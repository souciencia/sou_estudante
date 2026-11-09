'use client'

import { useQuery } from '@tanstack/react-query'
import { municipioService } from '@/services/api/municipio.service'
import type { MunicipiosMap } from '@/services/api/types'

export interface UseMunicipiosReturn {
  municipios: MunicipiosMap
  isLoading: boolean
  isError: boolean
}

/**
 * Carrega os municípios por UF uma única vez (índice pequeno, ~27 documentos)
 * e mantém em cache no React Query, sem depender da busca em curso.
 */
export function useMunicipios(): UseMunicipiosReturn {
  const { data, isPending, isError } = useQuery({
    queryKey: ['municipios'],
    queryFn: async () => {
      const result = await municipioService.listarMunicipios()
      if (!result.success) {
        throw result.error
      }
      return result.data
    },
    staleTime: Infinity,
  })

  return {
    municipios: data ?? {},
    isLoading: isPending,
    isError,
  }
}
