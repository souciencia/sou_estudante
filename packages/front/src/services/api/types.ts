/**
 * Response genérico da API do backend Go
 */
export type ApiResponse<T> = {
  results?: T[]
  // Pode ter outros campos no futuro: pagination, total, etc.
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError }

export type ApiErrorType =
  | 'network' // Sem internet, timeout, DNS failure
  | 'server' // 5xx errors (Internal Server Error, etc.)
  | 'client' // 4xx errors (404, 400, 401, etc.)
  | 'parse' // JSON inválido ou malformado
  | 'validation' // Response não tem formato esperado

export type ApiError = {
  type: ApiErrorType
  message: string
  statusCode?: number
  originalError?: unknown
}

export const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  network: 'Sem conexão com a internet 📡',
  server: 'Serviço temporariamente indisponível ⚙️',
  client: 'Busca inválida. Digite pelo menos 5 caracteres 🔍',
  parse: 'Erro ao processar resposta do servidor 🔧',
  validation: 'Nenhum resultado encontrado 🤷',
}

/**
 * Type guard para verificar se um resultado é um erro
 */
export function isApiError(
  result: Result<unknown>,
): result is { success: false; error: ApiError } {
  return !result.success
}

export interface PaginationLinks {
  self: string
  first: string
  prev?: string
  next?: string
  last: string
}

export interface AggregationBucket {
  key: string
  count: number
}

export interface SearchAggregations {
  ufs?: AggregationBucket[]
  turnos?: AggregationBucket[]
  graus?: AggregationBucket[]
  categorias?: AggregationBucket[]
  modalidades?: AggregationBucket[]
  enades?: AggregationBucket[]
}

export interface CursoListResponse {
  total: number
  page: number
  limit: number
  results: Curso[]
  links: PaginationLinks
  aggregations?: SearchAggregations
}

// Tipos da estrutura do índice de cursos

export interface Curso {
  sequencial?: number
  nu_ano_censo?: number
  edicao?: string
  dt_carga?: string
  instituicao: Instituicao
  curso: DadosCurso
  localizacao: Localizacao
  censo_metricas: CensoMetricas
  enade: Enade
  tda: Tda
  sisu: Sisu
}

export interface Instituicao {
  co_ies?: string
}

export interface DadosCurso {
  co_curso?: string
  no_curso?: string
  tp_dimensao?: number
  tp_grau_academico?: string
  no_grau_academico?: string
  in_gratuito: boolean
  tp_modalidade_ensino?: string
  no_modalidade_ensino?: string
  tp_nivel_academico?: string
  no_nivel_academico?: string
  cine: Cine
}

export interface Cine {
  co_cine_rotulo?: string
  no_cine_rotulo?: string
  co_cine_area_geral?: string
  no_cine_area_geral?: string
  co_cine_area_especifica?: string
  no_cine_area_especifica?: string
  co_cine_area_detalhada?: string
  no_cine_area_detalhada?: string
}

export interface Localizacao {
  co_regiao?: string
  no_regiao?: string
  co_uf?: string
  no_uf?: string
  sg_uf?: string
  co_municipio?: string
  no_municipio?: string
  in_capital: boolean
}

export interface CensoMetricas {
  qt_vg_total?: number
  qt_vg_total_diurno?: number
  qt_vg_total_noturno?: number
  qt_vg_total_ead?: number
  qt_ing?: number
  qt_ing_prounii?: number
  qt_ing_prounip?: number
  qt_ing_fies?: number
  qt_ing_rpfies?: number
  qt_ing_nrpfies?: number
  qt_ing_reserva_vaga?: number
  qt_mat?: number
  qt_apoio_social?: number
  qt_mat_apoio_social?: number
  qt_ativ_extracurricular?: number
  qt_mat_ativ_extracurricular?: number
}

export interface Enade {
  ano_enade?: number
  conceito_continuo_enade?: number
  conceito_faixa_enade?: string
}

export interface Tda {
  nu_ano_ingresso_tda?: number
  nu_ano_referencia_tda?: number
  tap?: number
  tca?: number
  tda?: number
}

export interface Sisu {
  tem_sisu: boolean
  ofertas: Oferta[]
}

export interface Oferta {
  municipio?: string
  nome_municipio?: string
  turno?: string
  modalidade?: string
  ordem_modalidade?: number
  grupo?: string
  descricao?: string
  vagas?: number
  nota_corte?: number
  inscricoes?: number
}
