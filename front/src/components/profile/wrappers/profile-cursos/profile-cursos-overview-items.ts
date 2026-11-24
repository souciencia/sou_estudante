import type { OverviewItem } from '@/components/profile'
import type { Curso } from '@/services/api/types'
import { buildTurno } from '@/utils/turno'

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''

/**
 * Monta a lista de atributos exibidos na aba "Visão geral" a partir do curso.
 */
export function buildOverviewItems(curso: Curso): OverviewItem[] {
  const turno = buildTurno(curso)
  const vagas = curso.censo_metricas?.qt_vg_total

  return [
    { label: 'Grau', value: curso.curso?.no_grau_academico },
    { label: 'Turno', value: turno.value, note: turno.note },
    {
      label: 'Modalidade',
      value: capitalize(curso.curso?.no_modalidade_ensino),
    },
    {
      label: 'Vagas/ano',
      value: vagas !== undefined ? String(vagas) : undefined,
      note: vagas !== undefined ? 'Censo 2024' : undefined,
    },
    { label: 'Categoria', value: curso.instituicao?.categoria_administrativa },
    {
      label: 'Tem mensalidade?',
      value:
        curso.curso?.in_gratuito === undefined
          ? undefined
          : curso.curso.in_gratuito
            ? 'Não'
            : 'Sim',
    },
  ]
}
