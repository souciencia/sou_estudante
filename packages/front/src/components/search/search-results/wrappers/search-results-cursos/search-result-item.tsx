import { ArrowRight, MapPin } from 'lucide-react'
import Link from 'next/link'
import type { ReactElement } from 'react'
import { MaskEnade } from '@/components/enade/mask-enade/mask-enade'
import { Card, type CardTag } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox/checkbox'
import { TagEnade } from '@/components/ui/tag/wrappers/tag-enade/tag-enade'
import { parseEnadeLevel } from '@/lib/enade'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'

interface SearchResultItemProps {
  curso: Curso
  module?: Module
  /** Modo de comparação ativo: revela o checkbox de seleção na esquerda. */
  comparing?: boolean
  selected?: boolean
  disabled?: boolean
  onToggle?: (id: string) => void
  /** Origem da busca (ex.: `ingresso`), que define o perfil para onde o card aponta. */
  to?: string
}

export function SearchResultItem({
  curso,
  module,
  comparing = false,
  selected = false,
  disabled = false,
  onToggle,
  to,
}: SearchResultItemProps) {
  // Extrair dados da estrutura completa
  const nomeCurso = curso.curso?.no_curso || 'Curso não especificado'
  const instituicao = curso.instituicao?.no_ies || ''
  const modalidade = curso.curso?.no_modalidade_ensino || ''
  const municipio = curso.localizacao?.no_municipio || ''
  const uf = curso.localizacao?.sg_uf || ''

  // Dados de qualidade
  const conceitoEnade = parseEnadeLevel(curso.enade?.conceito_faixa_enade)
  const taxaDesistencia = curso.tda?.tda

  // Dados do SISU (primeira oferta do curso)
  const temSisu = curso.sisu?.tem_sisu ?? false
  const oferta = curso.sisu?.ofertas?.[0]
  const turno = oferta?.turno || ''
  const gratuito = curso.curso?.in_gratuito

  const idCurso = curso.curso?.co_curso || ''

  // Localização
  const localizacaoItens = [municipio, uf].filter(Boolean)
  const localizacaoCompleta = localizacaoItens.join(' - ')
  const localizacaoTag = localizacaoItens.join(', ')

  // Vagas (Censo)
  const totalVagas = curso.censo_metricas?.qt_vg_total
  const vagasTag =
    typeof totalVagas === 'number'
      ? `${totalVagas} ${totalVagas === 1 ? 'vaga' : 'vagas'}`
      : undefined

  // Montar tags dinâmicas
  const tags: Array<string | CardTag | ReactElement> = []
  const tagsBottom: Array<string | CardTag | ReactElement> = []
  tags.push(<TagEnade key="enade" level={conceitoEnade} />)
  if (gratuito) tags.push({ label: 'Gratuito', tone: 'green' })
  if (temSisu) tags.push({ label: 'Tem Sisu', tone: 'blue' })
  if (modalidade) tags.push(modalidade)
  if (turno) tags.push(turno)
  if (localizacaoTag) {
    tagsBottom.push({
      label: localizacaoTag,
      icon: <MapPin aria-hidden className="size-3" />,
      source: 'Censo',
      tone: 'blue',
    })
  }
  if (vagasTag) {
    tagsBottom.push({ label: vagasTag, source: 'Censo' })
  }

  const cardContent = (
    <>
      <Card.Backdrop>
        <MaskEnade level={conceitoEnade} />
      </Card.Backdrop>
      <Card.Header>
        <Card.Title
          level={3}
          title={`${nomeCurso} • ${idCurso}`}
          subtitle={`${instituicao} • ${localizacaoCompleta}`}
        />
      </Card.Header>
      <hr className="border-t-[1px] border-border-secondary my-2 relative -z-20" />

      {tags.length > 0 && <Card.Tags source={tags} />}

      <hr className="border-t-[1px] border-border-secondary my-2 relative -z-20" />
      <Card.ProgressBar
        title="Taxa de desistência acumulada (5 anos)"
        percentage={
          typeof taxaDesistencia === 'number'
            ? `${Math.round(taxaDesistencia)}%`
            : undefined
        }
        emptyHint="sem dados"
      />

      <hr className="border-t-[1px] border-border-secondary my-2 relative -z-20" />
      {tagsBottom.length > 0 && <Card.Tags source={tagsBottom} />}
    </>
  )

  const id = curso.sequencial
  if (id === undefined) {
    return <Card module={module}>{cardContent}</Card>
  }

  const detailHref =
    to === 'ingresso'
      ? `/ingresso/${id}`
      : to === 'permanencia'
        ? `/permanencia/${id}`
        : `/cursos/${id}`

  return (
    <div className="space-y-2" data-module={module}>
      <Card module={module}>
        <div className="flex flex-col items-start gap-3">
          {comparing && (
            <Checkbox
              module={module}
              checked={selected}
              disabled={disabled}
              onChange={() => onToggle?.(String(id))}
              aria-label={`Comparar ${nomeCurso}`}
              className="size-6"
            />
          )}
          <Link
            href={detailHref}
            aria-label={`Ver detalhes do curso ${nomeCurso}`}
            className="block min-w-0 flex-1 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
          >
            {cardContent}
          </Link>
          {temSisu && to !== 'ingresso' && (
            <Link
              href={`/ingresso/${id}`}
              aria-label={`Ver ingresso via Sisu de ${nomeCurso}`}
              className="inline-flex items-center gap-1 rounded-full px-1 font-sans text-xs font-bold text-accent-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
            >
              Ver ingresso via Sisu
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          )}
        </div>
      </Card>
    </div>
  )
}
