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
 * Aplica o timeout padrão da API ao `signal` da chamada, preservando um
 * `signal` recebido do chamador (o que disparar primeiro cancela o fetch).
 */
function withTimeout(signal?: AbortSignal | null): AbortSignal {
  const timeout = AbortSignal.timeout(API_CONFIG.TIMEOUT_MS)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
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

  try {
    const response = await fetch(url, {
      ...options,
      signal: withTimeout(options?.signal),
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
