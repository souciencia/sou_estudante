import { apiClient } from './client'
import { API_CONFIG } from './config'
import { buildSearchParams } from './search-params'
import type {
  Curso,
  CursoListResponse,
  Result,
  Sugestao,
  SugestoesResponse,
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
   * @returns Result com CursoListResponse paginado; em falha, o erro tipado da API
   */
  async searchCursos(
    query: string,
    page = 1,
    limit = 20,
    filters?: Record<string, string | null>,
  ): Promise<Result<CursoListResponse>> {
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
      return { success: true, data: emptyResponse }
    }

    const params = buildSearchParams(query, page, limit, filters)

    return apiClient<CursoListResponse>(
      `${API_CONFIG.ENDPOINTS.SEARCH_CURSOS}?${params.toString()}`,
    )
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
   * @returns Lista de sugestões de cursos (nome + contagem)
   */
  async sugerirCursos(termo: string): Promise<Sugestao[]> {
    const normalized = termo.trim()

    if (normalized.length < API_CONFIG.SUGGEST_MIN_CHARS) {
      return []
    }

    const params = new URLSearchParams()
    params.set('q', normalized)
    params.set('limit', String(API_CONFIG.SUGGEST_LIMIT))

    const result = await apiClient<SugestoesResponse>(
      `${API_CONFIG.ENDPOINTS.SUGESTOES_CURSOS}?${params.toString()}`,
    )

    return result.success ? result.data.results : []
  },
}
