import type { OverviewItem } from '@/components/features/profile'
import type { Curso } from '@/services/api/types'

const capitalize = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''

/**
 * Deriva os rótulos de turno a partir das vagas do Censo, com fallback para a
 * oferta do Sisu. Retorna o rótulo e a nota de origem exibidos na lista.
 */
function buildTurno(curso: Curso): { value: string; note?: string } {
  const censo = curso.censo_metricas
  const turnos: string[] = []
  if ((censo?.qt_vg_total_diurno ?? 0) > 0) turnos.push('Diurno')
  if ((censo?.qt_vg_total_noturno ?? 0) > 0) turnos.push('Noturno')
  if ((censo?.qt_vg_total_ead ?? 0) > 0) turnos.push('EaD')

  if (turnos.length > 0) {
    return { value: turnos.join(' / '), note: 'com vagas · Censo' }
  }

  const oferta = curso.sisu?.ofertas?.[0]
  return { value: capitalize(oferta?.turno) }
}

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
      note: vagas !== undefined ? 'Censo' : undefined,
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
