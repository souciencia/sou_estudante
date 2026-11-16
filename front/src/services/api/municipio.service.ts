import { apiClient } from './client'
import { API_CONFIG } from './config'
import type { MunicipiosMap, Result } from './types'

/**
 * Serviço de municípios: lista os municípios por UF (índice estados-municipios).
 */
export const municipioService = {
  /**
   * Lista todos os municípios agrupados por sigla de UF.
   * @returns Result com o mapa de municípios; em falha, o erro tipado da API.
   */
  async listarMunicipios(): Promise<Result<MunicipiosMap>> {
    return apiClient<MunicipiosMap>(API_CONFIG.ENDPOINTS.MUNICIPIOS)
  },
}
