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
export { municipioService } from './municipio.service'
export * from './types'
export { useCurso } from './use-curso'
export { useIes } from './use-ies'
export { type UseMunicipiosReturn, useMunicipios } from './use-municipios'
export { type UseResourceOptions, useResource } from './use-resource'
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
