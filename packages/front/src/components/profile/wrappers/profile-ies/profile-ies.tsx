import { Profile } from '@/components/profile'
import { Route } from '@/components/ui/route/route'
import { Tag } from '@/components/ui/tag/tag'
import { MODULE_META, type Module } from '@/lib/module'
import type { IES } from '@/services/api/types'
import { ProfileIESFaculty } from './profile-ies-faculty'
import { ProfileIESOverview } from './profile-ies-overview'

interface ProfileIESProps {
  ies: IES
  module?: Module
  /** Id do curso de origem, usado para voltar aos perfis do mesmo curso. */
  courseId?: number
}

/**
 * Wrapper da IES sobre o núcleo agnóstico `Profile`: preenche os dados
 * cadastrais da instituição.
 */
export const ProfileIES = ({
  ies,
  module = '4',
  courseId,
}: ProfileIESProps) => {
  const nome = ies.no_ies ?? 'Instituição não especificada'
  const titulo = ies.sg_ies || nome
  const subtitulo = ies.sg_ies ? nome.toUpperCase() : undefined

  const organizacao = ies.organizacao_academica?.no_organizacao_academica
  const categoria = ies.categoria_administrativa?.no_categoria_administrativa

  const tags = [organizacao, categoria].filter(Boolean) as string[]

  return (
    <Profile module={module} iesId={ies.co_ies} courseId={courseId}>
      <Profile.Header
        badge={MODULE_META[module].badge}
        title={titulo}
        subtitle={subtitulo}
        className="bg-white"
      >
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-x-2">
            {tags.map((tag) => (
              <Tag
                key={tag}
                label={tag}
                className="mr-0 text-2xs py-[3px]"
                variant="none"
              />
            ))}
          </div>
        )}
      </Profile.Header>

      <div className="mb-[0.875rem] mt-4 flex items-center gap-[0.625rem] px-4">
        <span className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
          Panorama da Instituição
        </span>
        <div className="h-[1.5px] flex-1 bg-border-secondary" />
      </div>

      <ProfileIESOverview
        matriculados={ies.vagas_matriculas?.qt_mat ?? null}
        qtd_cursos={ies.docentes?.qt_cursos ?? null}
        docentes={ies.docentes?.qt_doc_exe ?? null}
      />

      <div className="mb-[0.875rem] mt-6 flex items-center gap-[0.625rem] px-4">
        <span className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
          Corpo docente da instituição
        </span>
        <div className="h-[1.5px] flex-1 bg-border-secondary" />
      </div>

      <ProfileIESFaculty ies={ies.docentes} />

      <Profile.Section title="Continue sua rota" className="mt-4">
        <Route
          module="5"
          variant="inline"
          title="Comparar cursos entre instituições"
          description="Lado a lado pelos mesmos indicadores — Sextante"
        />
        <Route module="1" variant="inline" />
      </Profile.Section>
    </Profile>
  )
}
