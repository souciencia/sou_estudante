import { Card } from '@/components/features/card'
import type { Module } from '@/lib/module'
import type { IES } from '@/services/api/types'

interface IesResultItemProps {
  ies: IES
  module?: Module
}

export default function IesResultItem({ ies, module }: IesResultItemProps) {
  const nome = ies.no_ies || 'Instituição não especificada'
  const sigla = ies.sg_ies || ''
  const localizacao = [ies.municipio, ies.uf].filter(Boolean).join(' - ')

  const tags = [
    ies.categoria_administrativa,
    ies.organizacao_academica,
    ies.regiao,
  ].filter(Boolean) as string[]

  return (
    <Card module={module}>
      <Card.Header title={nome} subtitle={sigla ? `• ${sigla}` : ''} />
      {tags.length > 0 && <Card.Tags source={tags} className="ml-11" />}
      <Card.Fields
        className="ml-11 mt-2"
        items={[{ label: 'Localização', value: localizacao }]}
      />
    </Card>
  )
}
