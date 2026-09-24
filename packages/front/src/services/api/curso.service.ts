// src/services/api/curso.service.ts
import { apiClient } from './client'
import { API_CONFIG } from './config'
import type {
  Curso,
  CursoListResponse,
  Result,
  SugestoesCursosResponse,
} from './types'

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

  /**
   * Busca um curso específico pelo seu sequencial.
   * @param id - Sequencial do curso (mesmo `_id` do documento no índice)
   * @returns Result com o curso detalhado; em falha, distingue 404 de erro
   */
  async getCurso(id: string): Promise<Result<Curso>> {
    const normalized = id?.trim()

    if (!normalized) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Identificador do curso é obrigatório',
        },
      }
    }

    return apiClient<Curso>(API_CONFIG.ENDPOINTS.DETAIL_CURSO(normalized))
  },

  /**
   * Busca nomes de cursos para autocomplete (consulta o índice de dicionário na API)
   * @param termo - Texto digitado pelo usuário (ex: "medic")
   * @returns Lista de nomes de cursos sugeridos
   */
  async sugerirCursos(termo: string): Promise<string[]> {
    const normalized = termo.trim()

    if (normalized.length < API_CONFIG.SUGGEST_MIN_CHARS) {
      return []
    }

    const params = new URLSearchParams()
    params.set('q', normalized)

    const result = await apiClient<SugestoesCursosResponse>(
      `${API_CONFIG.ENDPOINTS.SUGESTOES_CURSOS}?${params.toString()}`,
    )

    return result.success ? result.data.results : []
  },
}
