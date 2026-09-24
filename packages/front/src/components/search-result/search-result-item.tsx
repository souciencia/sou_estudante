import Link from 'next/link'
import { Card } from '@/components/card'
import { ENADE_FAIXAS, type EnadeFaixa } from '@/lib/enade'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'

interface SearchResultItemProps {
  curso: Curso
  module?: Module
}

export default function SearchResultItem({
  curso,
  module,
}: SearchResultItemProps) {
  // Extrair dados da estrutura completa
  const nomeCurso = curso.curso?.no_curso || 'Curso não especificado'
  const grauAcademico = curso.curso?.no_grau_academico || ''
  const modalidade = curso.curso?.no_modalidade_ensino || ''
  const municipio = curso.localizacao?.no_municipio || ''
  const uf = curso.localizacao?.sg_uf || ''

  // Dados de qualidade
  const conceitoEnade = curso.enade?.conceito_faixa_enade

  // Dados do SISU (primeira oferta do curso)
  const oferta = curso.sisu?.ofertas?.[0]
  const notaCorte = oferta?.nota_corte
  const turno = oferta?.turno || ''
  const gratuito = curso.curso?.in_gratuito

  // Montar tags dinâmicas
  const tags: string[] = []
  if (gratuito) tags.push('Gratuito')
  if (modalidade) tags.push(modalidade)
  if (turno) tags.push(turno)
  if (grauAcademico) tags.push(grauAcademico)

  // Localização completa
  const localizacaoCompleta = [municipio, uf].filter(Boolean).join(' - ')

  // Converter conceito ENADE para tipo aceito pelo componente
  const conceitoEnadeFormatado: EnadeFaixa | undefined =
    conceitoEnade &&
    ENADE_FAIXAS.includes(conceitoEnade.toString() as EnadeFaixa)
      ? (conceitoEnade.toString() as EnadeFaixa)
      : undefined

  const card = (
    <Card module={module}>
      <Card.Header
        title={nomeCurso}
        subtitle={localizacaoCompleta ? `• ${localizacaoCompleta}` : ''}
      >
        {conceitoEnadeFormatado && (
          <Card.IconEnade n={conceitoEnadeFormatado} />
        )}
      </Card.Header>
      {tags.length > 0 && <Card.Tags source={tags} className="ml-11" />}
      {notaCorte && (
        <Card.ProgressBar
          title="Nota de corte"
          percentage={`${Math.round((notaCorte / 1000) * 100)}%`}
        />
      )}
    </Card>
  )

  const id = curso.sequencial ?? curso._id
  if (id === undefined) {
    return card
  }

  return (
    <Link
      href={`/cursos/${id}`}
      className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
    >
      {card}
    </Link>
  )
}
