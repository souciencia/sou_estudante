import { API_CONFIG } from './config'
import type { ApiError, ApiErrorType, Result } from './types'

/**
 * Função helper para criar erros tipados
 */
function createApiError(
  type: ApiErrorType,
  message: string,
  statusCode?: number,
  originalError?: unknown,
): ApiError {
  return { type, message, statusCode, originalError }
}

/**
 * Cliente HTTP genérico reutilizável
 *
 * Encapsula lógica de:
 * - Fetch com base URL
 * - Error handling tipado
 * - Cache do Next.js
 * - Parse de JSON
 *
 * @param endpoint
 * @param options
 * @returns
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<Result<T>> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`

  // Debug: log da URL que está sendo chamada
  console.log('[apiClient] Chamando URL:', url)
  console.log(
    '[apiClient] Ambiente:',
    typeof window === 'undefined' ? 'SERVER' : 'CLIENT',
  )

  try {
    const response = await fetch(url, {
      ...options,
      // Merge com configurações padrão do Next.js
      next: {
        revalidate: API_CONFIG.CACHE.REVALIDATE_SECONDS,
        ...options?.next,
      },
    })

    // Erros HTTP (4xx, 5xx)
    if (!response.ok) {
      const errorType: ApiErrorType =
        response.status >= 500 ? 'server' : 'client'

      return {
        success: false,
        error: createApiError(
          errorType,
          `Erro na API: ${response.statusText}`,
          response.status,
        ),
      }
    }

    // Parse JSON
    let data: T
    try {
      data = await response.json()
    } catch (parseError) {
      return {
        success: false,
        error: createApiError(
          'parse',
          'Resposta da API não é um JSON válido',
          response.status,
          parseError,
        ),
      }
    }

    return { success: true, data }
  } catch (error) {
    // Erros de rede (offline, timeout, DNS, etc.)
    return {
      success: false,
      error: createApiError(
        'network',
        'Erro de conexão com a API. Verifique sua internet.',
        undefined,
        error,
      ),
    }
  }
}
