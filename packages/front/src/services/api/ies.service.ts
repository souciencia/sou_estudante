import { apiClient } from './client'
import { API_CONFIG } from './config'
import { buildSearchParams } from './search-params'
import type { IES, IesListResponse, Result, SugestoesResponse } from './types'

/**
 * Serviço de IES - encapsula as operações do índice de instituições
 */
export const iesService = {
  /**
   * @param query - Texto de busca (opcional; vazio lista todas as IES)
   * @param page - Número da página (padrão: 1)
   * @param limit - Resultados por página (padrão: 20)
   * @param filters - Filtros opcionais (uf, regiao, categoria, organizacao, sort)
   * @returns Result com IesListResponse paginado; em falha, o erro tipado da API
   */
  async searchIes(
    query: string,
    page = 1,
    limit = 20,
    filters?: Record<string, string | null>,
  ): Promise<Result<IesListResponse>> {

    const filtersDefault = { // busca por relevancia torna-se padrao
      sort: 'relevancia',
      ...filters, 
    }

    // torna query maiuscula para conseguir buscar as siglas de ies corretamente
    const queryDefault = query.toUpperCase();

    const params = buildSearchParams(queryDefault, page, limit, filtersDefault)

    return apiClient<IesListResponse>(
      `${API_CONFIG.ENDPOINTS.SEARCH_IES}?${params.toString()}`,
    )
  },

  /**
   * Busca uma IES específica pelo seu co_ies.
   * @param coIes - Código da IES (mesmo `_id` do documento no índice)
   * @returns Result com a IES; em falha, distingue 404 de erro
   */
  async getIes(coIes: string): Promise<Result<IES>> {
    const normalized = coIes?.trim()

    if (!normalized) {
      return {
        success: false,
        error: {
          type: 'validation',
          message: 'Identificador da IES é obrigatório',
        },
      }
    }

    return apiClient<IES>(API_CONFIG.ENDPOINTS.DETAIL_IES(normalized))
  },

  /**
   * Busca nomes de IES para autocomplete (índice de dicionário na API)
   * @param termo - Texto digitado pelo usuário (ex: "univers")
   * @returns Lista de nomes de IES sugeridos
   */
  async sugerirIes(termo: string): Promise<string[]> {
    const normalized = termo.trim()

    if (normalized.length < API_CONFIG.SUGGEST_MIN_CHARS) {
      return []
    }

    const params = new URLSearchParams()
    params.set('q', normalized)

    const result = await apiClient<SugestoesResponse>(
      `${API_CONFIG.ENDPOINTS.SUGESTOES_IES}?${params.toString()}`,
    )

    return result.success ? result.data.results : []
  },
}
