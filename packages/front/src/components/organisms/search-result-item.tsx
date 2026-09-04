// components/SearchResultItem.tsx

import { Card } from '@/components/molecules/card'
import type { Curso } from '@/services/api/types'

interface SearchResultItemProps {
  curso: Curso
}

export default function SearchResultItem({ curso }: SearchResultItemProps) {
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
  const conceitoEnadeFormatado =
    conceitoEnade &&
    ['1', '2', '3', '4', '5'].includes(conceitoEnade.toString())
      ? (conceitoEnade.toString() as '1' | '2' | '3' | '4' | '5')
      : undefined

  return (
    <Card>
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
}
