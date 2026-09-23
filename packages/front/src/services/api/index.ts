/**
 * Barrel export - facilita imports
 *
 * @example
 * import { cursoService, API_CONFIG, apiClient } from '@/services/api';
 */

export { apiClient } from './client'
export { API_CONFIG } from './config'
export { cursoService } from './curso.service'
export { iesService } from './ies.service'
export * from './types'
export {
  type UseSearchOptions,
  type UseSearchReturn,
  useSearch,
} from './use-search'
export { useSearchCursos } from './use-search-cursos'
export { useSearchIes } from './use-search-ies'
export { useSugestoes } from './use-sugestoes'
export { useSugestoesCursos } from './use-sugestoes-cursos'
export { useSugestoesIes } from './use-sugestoes-ies'
