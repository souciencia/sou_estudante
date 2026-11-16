const META_KEYS = new Set(['q', 'page', 'limit'])

/**
 * Monta a query string de uma busca paginada, ignorando filtros vazios e os
 * parâmetros de controle (`q`, `page`, `limit`). Compartilhado pelos serviços
 * de cursos e IES.
 */
export function buildSearchParams(
  query: string,
  page: number,
  limit: number,
  filters?: Record<string, string | null>,
): URLSearchParams {
  const params = new URLSearchParams()

  const normalizedQuery = query?.trim() ?? ''
  if (normalizedQuery.length > 0) {
    params.set('q', normalizedQuery)
  }
  params.set('page', String(page))
  params.set('limit', String(limit))

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== null && value !== '' && !META_KEYS.has(key)) {
        params.set(key, value)
      }
    }
  }

  return params
}
