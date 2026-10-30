import Link from 'next/link'
import { Card } from '@/components/ui/card'
import type { Module } from '@/lib/module'
import type { IES } from '@/services/api/types'

interface IesResultItemProps {
  ies: IES
  module?: Module
}

export function IesResultItem({ ies, module }: IesResultItemProps) {
  const nome = ies.no_ies || 'Instituição não especificada'
  const sigla = ies.sg_ies || ''
  const localizacao = [ies.localizacao?.no_municipio, ies.localizacao?.sg_uf]
    .filter(Boolean)
    .join(' - ')

  const tags = [
    ies.categoria_administrativa?.no_categoria_administrativa,
    ies.organizacao_academica?.no_organizacao_academica,
    ies.localizacao?.no_regiao,
  ].filter(Boolean) as string[]

  const card = (
    <Card module={module}>
      <Card.Header>
        <Card.Title
          level={3}
          title={nome}
          subtitle={sigla ? `${sigla}` : undefined}
        />
      </Card.Header>
      {tags.length > 0 && <Card.Tags source={tags} />}
      <Card.Fields
        className="mt-2"
        items={[{ label: 'Localização', value: localizacao }]}
      />
    </Card>
  )

  if (!ies.co_ies) {
    return card
  }

  return (
    <Link
      href={`/ies/${ies.co_ies}`}
      aria-label={`Ver detalhes da instituição ${nome}`}
      className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
    >
      {card}
    </Link>
  )
}
