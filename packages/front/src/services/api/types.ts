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

export interface CursoListResponse {
  total: number
  page: number
  limit: number
  results: OfertaCompleta[]
}

// Tipos da nova estrutura da API baseada no índice Ofertas

export interface OfertaCompleta {
  sequencial?: number
  nu_ano_censo?: number
  edicao?: string
  dt_carga?: string
  instituicao: InstituicaoCompleta
  curso: CursoCompleto
  localizacao: LocalizacaoCompleta
  censo_metricas: CensoMetricas
  qualidade_mec: QualidadeMEC
  sisu: SisuInfo
}

export interface InstituicaoCompleta {
  co_ies?: string
  no_ies?: string
  sg_ies?: string
  co_mantenedora_ies?: string
  no_mantenedora_ies?: string
  tp_categoria_administrativa_ies?: string
  no_categoria_administrativa_ies?: string
  tp_organizacao_academica_ies?: string
  no_organizacao_academica_ies?: string
  tp_rede_ies?: string
  in_comunitaria_ies: boolean
  in_confessional_ies: boolean
  endereco: EnderecoIES
  corpo_docente: CorpoDocente
}

export interface EnderecoIES {
  ds_endereco_ies?: string
  ds_numero_endereco_ies?: string
  ds_complemento_endereco_ies?: string
  no_bairro_ies?: string
  nu_cep_ies?: string
}

export interface CorpoDocente {
  qt_doc_total?: number
  qt_doc_exe?: number
  doc_por_curso?: number
  perc_grad?: number
  perc_esp?: number
  perc_mestres?: number
  perc_doutores?: number
}

export interface CursoCompleto {
  co_curso?: string
  no_curso?: string
  tp_grau_academico?: string
  no_grau_academico?: string
  in_gratuito: boolean
  tp_modalidade_ensino?: string
  no_modalidade_ensino?: string
  tp_nivel_academico?: string
  no_nivel_academico?: string
  cine: CineClassificacao
}

export interface CineClassificacao {
  co_cine_rotulo?: string
  no_cine_rotulo?: string
  co_cine_area_geral?: string
  no_cine_area_geral?: string
  co_cine_area_especifica?: string
  no_cine_area_especifica?: string
  co_cine_area_detalhada?: string
  no_cine_area_detalhada?: string
}

export interface LocalizacaoCompleta {
  co_regiao?: string
  no_regiao?: string
  co_uf?: string
  no_uf?: string
  sg_uf?: string
  co_municipio?: string
  no_municipio?: string
  in_capital: boolean
  no_campus?: string
  no_municipio_campus?: string
  sg_uf_campus?: string
  ds_regiao_campus?: string
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
  qt_ing_reserva_vaga?: number
  qt_mat?: number
  qt_apoio_social?: number
  qt_mat_apoio_social?: number
  qt_ativ_extracurricular?: number
  qt_mat_ativ_extracurricular?: number
}

export interface QualidadeMEC {
  conceito_enade_continuo?: number
  conceito_enade_faixa?: number
  idd_continuo?: number
  idd_faixa?: number
  cpc_continuo?: number
  cpc_faixa?: number
  igc_continuo?: number
  igc_faixa?: number
  tap?: number
  tca?: number
  tda?: number
}

export interface SisuInfo {
  tem_sisu: boolean
  ds_turno?: string
  tp_mod_concorrencia?: string
  tipo_concorrencia?: string
  tipo_concorrencia_normalizado?: string
  ds_mod_concorrencia?: string
  qt_vagas_concorrencia?: number
  nu_notacorte?: number
  qt_inscricao?: number
}

// Manter CursoItem para compatibilidade com código existente (deprecated)
export interface CursoItem {
  id: string
  no_curso: string
  sg_ies: string
  no_ies: string
  ds_grau: string
  sg_uf: string
  nota_corte?: number
}

// =============

export type Instituicao = {
  // Códigos e Identificação
  co_ies: string
  no_ies: string
  sg_ies: string

  // Classificação da Instituição
  ds_organizacao_academica: string // Ex: Universidade, Centro Universitário, Faculdade
  ds_categoria_adm: string // Ex: Pública Federal, Pública Estadual, Privada

  // Localização do Campus
  no_campus: string
  no_municipio_campus: string
  sg_uf_campus: string
  ds_regiao: string
}

export type Oferta = {
  edicao: number

  // Dados da Instituição (IES) e Campus
  co_ies: string
  sg_ies: string
  no_municipio_campus: string
  sg_uf_campus: string

  // Dados do Curso
  co_ies_curso: string
  no_curso: string
  ds_grau: string
  ds_turno: string
  ds_periodicidade: string
  qt_semestre: number

  // Métricas e Vagas
  nu_notacorte: number
  qt_inscricao: number
  nu_vagas_autorizadas: number
  qt_vagas_ofertadas: number
  nu_percentual_bonus: number

  // Modalidade de Concorrência e Cotas
  tp_mod_concorrencia: string
  tp_cota: string
  ds_mod_concorrencia: string

  // Pesos das Notas do ENEM
  pesos: PesosOferta

  // Notas Mínimas Exigidas
  notas_minimas: NotasMinimasOferta

  // Recortes de Percentuais
  percentuais_ibge: PercentuaisIbgeOferta
  percentuais_ies: PercentuaisIesOferta
}

export type PesosOferta = {
  redacao: number
  linguagens: number
  matematica: number
  ciencias_humanas: number
  ciencias_natureza: number
}

export type NotasMinimasOferta = PesosOferta & {
  media_minima_enem: number
}

export type PercentuaisIbgeOferta = {
  perc_uf_pre_ppi: number
  perc_uf_pp: number
  perc_uf_i: number
  perc_uf_q: number
  perc_uf_pcd: number
}

export type PercentuaisIesOferta = {
  nu_perc_lei: number
  nu_perc_ppi: number
  nu_perc_pp: number
  nu_perc_i: number
  nu_perc_q: number
  nu_perc_pcd: number
}
