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
   * @returns CursoListResponse com resultados paginados
   */
  async searchCursos(
    query: string,
    page = 1,
    limit = 20,
  ): Promise<CursoListResponse> {
    if (!query || query.trim().length < API_CONFIG.SEARCH_MIN_CHARS) {
      return { total: 0, page, limit, results: [] }
    }

    const result = await apiClient<CursoListResponse>(
      `${API_CONFIG.ENDPOINTS.SEARCH_OFERTAS}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
    )

    return result.success ? result.data : { total: 0, page, limit, results: [] }
  },
}
