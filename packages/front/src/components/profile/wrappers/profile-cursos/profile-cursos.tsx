import { MapPin } from 'lucide-react'
import { Profile } from '@/components/profile'
import { Route } from '@/components/ui/route/route'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import { buildIesHref } from '@/lib/profile-links'
import type { Curso } from '@/services/api/types'
import { buildOverviewItems } from './profile-cursos-overview-items'
import { ProfileCursosQuality } from './profile-cursos-quality'

interface ProfileCursosProps {
  curso: Curso
  module?: Module
}

/**
 * Wrapper do curso sobre o núcleo agnóstico `Profile`: preenche os detalhes
 * específicos de curso (visão geral, qualidade e próximos passos).
 */
export const ProfileCursos = ({ curso, module = '1' }: ProfileCursosProps) => {
  const nomeCurso = curso.curso?.no_curso ?? 'Curso não especificado'
  const grau = curso.curso?.no_grau_academico
  const titulo = grau ? `${nomeCurso} — ${grau}` : nomeCurso
  const subtitulo =
    curso.instituicao?.sg_ies === 'INEXISTENTE'
      ? curso.instituicao?.no_ies?.toUpperCase()
      : curso.instituicao?.sg_ies ||
        curso.instituicao?.no_ies?.toUpperCase() ||
        undefined
  const cidade = curso.localizacao?.no_municipio
  const uf = curso.localizacao?.sg_uf
  const temSisu = curso.sisu?.tem_sisu ?? false
  const id = curso.sequencial
  const ingressoHref =
    temSisu && id !== undefined ? `/ingresso/${id}` : undefined
  const permanenciaHref = id !== undefined ? `/permanencia/${id}` : undefined
  const idIes = curso.instituicao.co_ies
  const iesHref = idIes !== undefined ? buildIesHref(idIes, id) : undefined

  return (
    <Profile module={module} courseId={id} iesId={idIes}>
      <Profile.Header
        badge={MODULE_META[module].badge}
        title={titulo}
        subtitle={subtitulo}
      >
        {temSisu && (
          <Tag
            label={'Com vagas no Sisu'}
            module={'2'}
            className="text-2xs py-[2px] bg-accent/10 border-accent/30"
            variant="module"
          />
        )}
      </Profile.Header>

      {cidade && (
        <Profile.Location
          icon={<MapPin className="size-4" />}
          eyebrow="Local de oferta"
          value={cidade}
          source="Censo da Educação Superior"
          tag={uf}
          module="2"
        />
      )}

      <Profile.Tabs defaultValue="overview">
        <Profile.TabList>
          <Profile.Tab value="overview">Visão geral</Profile.Tab>
          <Profile.Tab value="quality">Qualidade</Profile.Tab>
        </Profile.TabList>

        <Profile.TabPanel value="overview">
          <div className="p-4">
            <Profile.Overview items={buildOverviewItems(curso)} />
          </div>
        </Profile.TabPanel>

        <Profile.TabPanel value="quality">
          <ProfileCursosQuality curso={curso} module={module} />
        </Profile.TabPanel>
      </Profile.Tabs>

      <Profile.Section title="Continue sua rota" className="mt-1">
        {ingressoHref && (
          <Route
            module="2"
            variant="inline"
            href={ingressoHref}
            title="Como posso ingressar?"
            description="Veja vagas e informações do Sisu — Bússola"
          />
        )}
        <Route
          module="3"
          variant="inline"
          href={permanenciaHref}
          title="Vou conseguir me manter?"
          description="Bolsas, auxílios e outros apoios à permanência — Âncora"
        />
        <Route
          module="4"
          variant="inline"
          href={iesHref}
          title="Conheça a instituição"
          description="Indicadores oficiais e perfil da IES — Telescópio"
        />
      </Profile.Section>
    </Profile>
  )
}
