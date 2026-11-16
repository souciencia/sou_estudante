import { API_CONFIG } from './config'
import type { ApiError, ApiErrorType, Result } from './types'

/**
 * Base absoluta usada nos fetches do servidor (RSC e metadados). No navegador
 * as chamadas usam o proxy `/api`; no servidor é preciso uma URL absoluta,
 * resolvida pela rede interna (`API_URL`, padrão `http://se_api:8080`).
 */
function serverBaseUrl(): string {
  return process.env.API_URL || 'http://se_api:8080'
}

function createError(
  type: ApiErrorType,
  message: string,
  statusCode?: number,
): ApiError {
  return { type, message, statusCode }
}

/**
 * `fetch` no servidor com a mesma semântica de erro do `apiClient` do
 * navegador, devolvendo um `Result` tipado.
 */
export async function serverFetch<T>(endpoint: string): Promise<Result<T>> {
  try {
    const response = await fetch(`${serverBaseUrl()}${endpoint}`, {
      next: { revalidate: API_CONFIG.CACHE.REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      return {
        success: false,
        error: createError(
          response.status >= 500 ? 'server' : 'client',
          `Erro na API: ${response.statusText}`,
          response.status,
        ),
      }
    }

    return { success: true, data: (await response.json()) as T }
  } catch {
    return {
      success: false,
      error: createError('network', 'Erro de conexão com a API.'),
    }
  }
}
