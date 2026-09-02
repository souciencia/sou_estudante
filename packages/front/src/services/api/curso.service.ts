// src/services/api/curso.service.ts
import { apiClient } from './client'
import { API_CONFIG } from './config'
import type { CursoListResponse } from './types'

/**
 * Serviço de cursos - encapsula todas as operações relacionadas a cursos
 */
export const cursoService = {
  /**
   * @param query - Texto de busca (ex: "medicina", "engenharia civil")
   * @param page - Número da página (padrão: 1)
   * @param limit - Quantidade de resultados por página (padrão: 20)
   * @param filters - Filtros adicionais opcionais (uf, turno, grau, categoria, modalidade, enade, sort)
   * @returns CursoListResponse com resultados paginados
   */
  async searchCursos(
    query: string,
    page = 1,
    limit = 20,
    filters?: Record<string, string | null>,
  ): Promise<CursoListResponse> {
    const emptyResponse: CursoListResponse = {
      total: 0,
      page,
      limit,
      results: [],
      links: {
        self: '',
        first: '',
        last: '',
      },
    }

    if (!query || query.trim().length < API_CONFIG.SEARCH_MIN_CHARS) {
      return emptyResponse
    }

    const params = new URLSearchParams()
    params.set('q', query)
    params.set('page', String(page))
    params.set('limit', String(limit))

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (
          value !== null &&
          value !== '' &&
          key !== 'q' &&
          key !== 'page' &&
          key !== 'limit'
        ) {
          params.set(key, value)
        }
      }
    }

    const result = await apiClient<CursoListResponse>(
      `${API_CONFIG.ENDPOINTS.SEARCH_CURSOS}?${params.toString()}`,
    )

    return result.success ? result.data : emptyResponse
  },
}
