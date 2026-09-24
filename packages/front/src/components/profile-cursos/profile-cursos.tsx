'use client'

import { Info, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/button/button'
import { Profile } from '@/components/profile'
import { Route } from '@/components/route/route'
import { MODULE_META, type Module } from '@/lib/module'
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
  const router = useRouter()

  const nomeCurso = curso.curso?.no_curso ?? 'Curso não especificado'
  const grau = curso.curso?.no_grau_academico
  const titulo = grau ? `${nomeCurso} — ${grau}` : nomeCurso
  const subtitulo =
    curso.instituicao?.sg_ies || curso.instituicao?.no_ies || undefined
  const cidade = curso.localizacao?.no_municipio
  const uf = curso.localizacao?.sg_uf

  return (
    <Profile module={module}>
      <Profile.TopBar backLabel="Resultados" backHref="/cursos">
        <Button
          v="solid"
          module={module}
          onClick={() => router.push('/cursos')}
        >
          Escolher curso
        </Button>
      </Profile.TopBar>

      <Profile.Header
        badge={MODULE_META[module].badge}
        title={titulo}
        subtitle={subtitulo}
      />

      {cidade && (
        <Profile.Location
          icon={<MapPin className="size-6" />}
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
          <div className="flex flex-col gap-5">
            <Profile.Overview items={buildOverviewItems(curso)} />
            <Button
              v="outline"
              module={module}
              className="self-start px-5 py-2"
            >
              <Info className="size-4" aria-hidden="true" />
              Como interpretar?
            </Button>
          </div>
        </Profile.TabPanel>

        <Profile.TabPanel value="quality">
          <ProfileCursosQuality curso={curso} module={module} />
        </Profile.TabPanel>
      </Profile.Tabs>

      <Profile.Section title="Continue sua rota" className="mt-4">
        <Route
          module="3"
          v="inline"
          title="Vou conseguir me manter?"
          description="Bolsas, cotas e apoios à permanência — Âncora"
        />
        <Route
          module="4"
          v="inline"
          title="Conheça a instituição"
          description="Indicadores oficiais e perfil da IES — Telescópio"
        />
      </Profile.Section>
    </Profile>
  )
}
