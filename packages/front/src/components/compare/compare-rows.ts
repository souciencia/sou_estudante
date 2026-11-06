import type { Curso } from '@/services/api/types'

export interface CompareRow {
  label: string
  values: (string | undefined)[]
  /** Dados numéricos são renderizados em fonte monoespaçada (`--font-mono`). */
  numeric?: boolean
}

export interface CompareSection {
  title: string
  source: string
  rows: CompareRow[]
  /** Rótulos das linhas em peso regular, sem o semibold padrão. */
  plainLabels?: boolean
}

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''

const NAO_USA_SISU = 'Sem vagas no Sisu · verifique as cotas na instituição'

const MODALIDADES_COTA: ReadonlyArray<{ codigo: string; label: string }> = [
  { codigo: 'LB_EP', label: 'Baixa renda · demais candidatos' },
  { codigo: 'LB_PCD', label: 'Baixa renda · pessoas com deficiência' },
  { codigo: 'LB_PPI', label: 'Baixa renda · pretos, pardos e indígenas' },
  { codigo: 'LB_Q', label: 'Baixa renda · quilombolas' },
  { codigo: 'LI_EP', label: 'Independente de renda · demais candidatos' },
  {
    codigo: 'LI_PCD',
    label: 'Independente de renda · pessoas com deficiência',
  },
  {
    codigo: 'LI_PPI',
    label: 'Independente de renda · pretos, pardos e indígenas',
  },
  { codigo: 'LI_Q', label: 'Independente de renda · quilombolas' },
]

const MODALIDADES_CONHECIDAS = new Set([
  'AC',
  ...MODALIDADES_COTA.map(({ codigo }) => codigo),
])

function notaCota(curso: Curso, codigo: string): string | undefined {
  if (!curso.sisu?.tem_sisu) return NAO_USA_SISU
  const oferta = curso.sisu?.ofertas?.find((o) => o.modalidade === codigo)
  return oferta?.nota_corte !== undefined
    ? String(oferta.nota_corte)
    : undefined
}

function outrasModalidades(curso: Curso): string | undefined {
  if (!curso.sisu?.tem_sisu) return NAO_USA_SISU
  const tem = curso.sisu?.ofertas?.some(
    (o) =>
      o.modalidade !== undefined && !MODALIDADES_CONHECIDAS.has(o.modalidade),
  )
  return tem ? 'Sim' : undefined
}

function enadeLabel(raw?: string): string | undefined {
  if (!raw) return undefined
  const normalized = raw.trim()
  if (/^[1-5]$/.test(normalized)) return `Nota ${normalized}`
  if (normalized.toUpperCase() === 'SC') return 'Sem conceito'
  return 'Sem avaliação'
}

/**
 * Deriva as seções/linhas da matriz de comparação a partir dos cursos
 * selecionados. Cada linha tem um valor por coluna (na ordem dos cursos);
 * colunas sem dado viram `undefined` (renderizadas como "—" pela matriz).
 */
export function buildCompareSections(
  cursos: (Curso | null)[],
): CompareSection[] {
  const column = (read: (curso: Curso) => string | undefined) =>
    cursos.map((curso) => (curso ? read(curso) : undefined))

  return [
    {
      title: 'Identidade',
      source: 'Censo da Educação Superior',
      rows: [
        { label: 'Instituição', values: column((c) => c.instituicao?.no_ies) },
        { label: 'UF', values: column((c) => c.localizacao?.sg_uf) },
        {
          label: 'Município',
          values: column((c) => c.localizacao?.no_municipio),
        },
        {
          label: 'Grau acadêmico',
          values: column((c) => c.curso?.no_grau_academico),
        },
        {
          label: 'Modalidade',
          values: column((c) => capitalize(c.curso?.no_modalidade_ensino)),
        },
        {
          label: 'Gratuidade',
          values: column((c) =>
            c.curso?.in_gratuito === undefined
              ? undefined
              : c.curso.in_gratuito
                ? 'Gratuito'
                : 'Pago',
          ),
        },
        {
          label: 'Vagas por ano',
          numeric: true,
          values: column((c) =>
            c.censo_metricas?.qt_vg_total !== undefined
              ? String(c.censo_metricas.qt_vg_total)
              : undefined,
          ),
        },
        {
          label: 'Matrículas',
          numeric: true,
          values: column((c) =>
            c.censo_metricas?.qt_mat !== undefined
              ? String(c.censo_metricas.qt_mat)
              : undefined,
          ),
        },
      ],
    },
    {
      title: 'Qualidade',
      source: 'Enade',
      rows: [
        {
          label: 'Conceito Enade',
          values: column((c) => enadeLabel(c.enade?.conceito_faixa_enade)),
        },
        {
          label: 'Ano do Enade',
          numeric: true,
          values: column((c) =>
            c.enade?.ano_enade !== undefined
              ? String(c.enade.ano_enade)
              : undefined,
          ),
        },
      ],
    },
    {
      title: 'Permanência',
      source: 'Taxa de Desistência Acumulada (TDA)',
      rows: [
        {
          label: 'Taxa de desistência',
          numeric: true,
          values: column((c) =>
            c.tda?.tda !== undefined ? `${Math.round(c.tda.tda)}%` : undefined,
          ),
        },
        {
          label: 'Ano de referência',
          numeric: true,
          values: column((c) =>
            c.tda?.nu_ano_referencia_tda !== undefined
              ? String(c.tda.nu_ano_referencia_tda)
              : undefined,
          ),
        },
      ],
    },
    {
      title: 'Ingresso',
      source: 'Sisu',
      rows: [
        {
          label: 'Oferta no Sisu',
          values: column((c) => (c.sisu?.tem_sisu ? 'Sim' : NAO_USA_SISU)),
        },
        {
          label: 'Nota de corte',
          numeric: true,
          values: column((c) => {
            if (!c.sisu?.tem_sisu) return NAO_USA_SISU
            const nota = c.sisu?.ofertas?.[0]?.nota_corte
            return nota !== undefined ? String(nota) : undefined
          }),
        },
        {
          label: 'Vagas no Sisu',
          numeric: true,
          values: column((c) => {
            if (!c.sisu?.tem_sisu) return NAO_USA_SISU
            const vagas = c.sisu?.ofertas?.[0]?.vagas
            return vagas !== undefined ? String(vagas) : undefined
          }),
        },
        {
          label: 'Turno',
          values: column((c) => {
            if (!c.sisu?.tem_sisu) return NAO_USA_SISU
            return capitalize(c.sisu?.ofertas?.[0]?.turno)
          }),
        },
      ],
    },
    {
      title: 'Por modalidade de cota',
      source: '1ª chamada',
      plainLabels: true,
      rows: [
        ...MODALIDADES_COTA.map(({ codigo, label }) => ({
          label,
          numeric: true,
          values: column((c) => notaCota(c, codigo)),
        })),
        {
          label: 'Outras modalidades da instituição',
          values: column((c) => outrasModalidades(c)),
        },
      ],
    },
  ]
}
