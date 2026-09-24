import { MapPin } from 'lucide-react'
import { Profile } from '@/components/profile'
import { Route } from '@/components/ui/route/route'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import type { IES } from '@/services/api/types'

interface ProfileIESProps {
  ies: IES
  module?: Module
}

/**
 * Wrapper da IES sobre o núcleo agnóstico `Profile`: preenche os dados
 * cadastrais da instituição.
 */
export const ProfileIES = ({ ies, module = '4' }: ProfileIESProps) => {
  const nome = ies.no_ies ?? 'Instituição não especificada'
  const titulo = ies.sg_ies || nome
  const subtitulo = ies.sg_ies ? nome : undefined

  const descritores = [ies.organizacao_academica, ies.categoria_administrativa]
    .filter(Boolean)
    .join(' · ')

  const tags = [ies.organizacao_academica, ies.categoria_administrativa].filter(
    Boolean,
  ) as string[]

  const regiao = ies.regiao ? `Região ${ies.regiao}` : undefined

  return (
    <Profile module={module}>
      <Profile.TopBar backLabel="Voltar" backHref="/ies" />

      <Profile.Header
        badge={MODULE_META[module].badge}
        title={titulo}
        subtitle={subtitulo}
      >
        {descritores && (
          <p className="font-protagonist text-protagonist font-semibold text-fg-protagonist">
            {descritores}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} module={module} className="mr-0" />
            ))}
          </div>
        )}
      </Profile.Header>

      {ies.municipio && (
        <Profile.Location
          icon={<MapPin className="size-6" />}
          eyebrow="Localização"
          value={ies.municipio}
          source={regiao}
          tag={ies.uf}
        />
      )}

      <Profile.Section title="Continue sua rota" className="mt-4">
        <Route
          module="5"
          v="inline"
          title="Comparar cursos entre instituições"
          description="Lado a lado pelos mesmos indicadores — Sextante"
        />
        <Route module="1" v="inline" />
      </Profile.Section>
    </Profile>
  )
}
