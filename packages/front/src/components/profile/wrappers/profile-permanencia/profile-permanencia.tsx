import { LifeBuoy } from 'lucide-react'
import { Callout } from '@/components/ui/callout'
import { Route } from '@/components/ui/route/route'
import { Tag } from '@/components/ui/tag/tag'
import type { Module } from '@/lib/module'
import { buildIesHref } from '@/lib/profile-links'
import type { Curso } from '@/services/api'
import { Profile } from '../..'
import { ProfilePermanenciaFinancing } from './profile-permanencia-financing'
import { ProfilePermanenciaReference } from './profile-permanencia-reference'
import { ProfilePermanenciaSupport } from './profile-permanencia-support'

interface ProfilePermanenciaProps {
  curso: Curso
  module?: Module
}

export const ProfilePermanencia = ({
  curso,
  module = '3',
}: ProfilePermanenciaProps) => {
  const nomeCurso = curso.curso.no_curso
  const grau = curso.curso.no_grau_academico
  const titulo = `${nomeCurso} — ${grau}`
  const cidade = curso.localizacao.no_municipio
  const uf = curso.localizacao.sg_uf
  const subtitulo = `${curso.instituicao.no_ies} · ${cidade} · ${uf}`
  const categoriaAdministrativa = curso.instituicao.categoria_administrativa
  const metricas = curso.censo_metricas
  const gratuito = curso.curso.in_gratuito
  const idIes = curso.instituicao.co_ies
  const iesHref =
    idIes !== undefined ? buildIesHref(idIes, curso.sequencial) : undefined

  const DESC_APOIO =
    'Auxílios de moradia, alimentação e transporte para quem mais precisa. O Censo agrega esses tipos em um único campo.'
  const DESC_ATIV =
    'Monitoria, iniciação científica, extensão e estágio não obrigatório — vínculos que ajudam a permanecer e a se formar.'
  const DESC_PROUNI =
    'Bolsa de estudo do governo para cursos pagos. Não é devolvida, mas pode ser integral (mensalidade toda coberta) ou parcial (cobre 50% — o restante é pago pelo estudante).'
  const DESC_FIES =
    'Financiamento estudantil: o valor da mensalidade é emprestado e devolvido após o curso, podendo haver juros conforme a modalidade.'
  const DESC_COTAS =
    'A Lei de Cotas reserva metade das vagas das instituições federais para quem cursou todo o ensino médio em escola pública. Dentro dessa metade, parte das vagas é destinada a estudantes com renda familiar de até 1 salário mínimo por pessoa, e há reservas específicas para pessoas pretas, pardas e indígenas, quilombolas e pessoas com deficiência. As instituições estaduais, municipais e privadas têm regras próprias. Veja os tipos e os documentos exigidos no Painel de Cotas.'

  return (
    <Profile
      module={module}
      className="p-4 pt-0"
      courseId={curso.sequencial}
      iesId={idIes}
    >
      <Profile.Header
        badge={'Permanência'}
        title={titulo}
        subtitle={subtitulo}
        className="px-0"
      >
        {grau && (
          <Tag label={grau} className="py-[2px] font-bold bg-white text-2xs" />
        )}
        {categoriaAdministrativa && (
          <Tag
            label={categoriaAdministrativa}
            className="py-[2px] font-bold bg-white text-2xs"
          />
        )}
      </Profile.Header>

      <ProfilePermanenciaReference
        ingressantes={metricas.qt_ing ?? 0}
        matriculados={metricas.qt_mat ?? 0}
      />

      <p className="mb-4 text-xs leading-[1.6] text-fg-muted">
        Cada apoio abaixo mostra{' '}
        <strong className="text-fg">quantos estudantes daquele ano</strong>{' '}
        foram beneficiados. A base muda conforme o dado: bolsas e cotas se
        referem a quem entrou no ano; os apoios de permanência, a todos os
        matriculados.
      </p>

      <div className="mb-[0.875rem] mt-6 flex items-center gap-[0.625rem]">
        <span className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
          Apoio à permanência
        </span>
        <div className="flex-1 h-[1.5px] bg-surface-deep"></div>
      </div>

      <ProfilePermanenciaSupport
        titulo={'Apoio Social'}
        valor={metricas.qt_mat_apoio_social ?? 0}
        matriculados={metricas.qt_mat ?? 0}
        descricao={DESC_APOIO}
      />
      <ProfilePermanenciaSupport
        titulo={'Atividade extracurricular'}
        valor={metricas.qt_ativ_extracurricular ?? 0}
        matriculados={metricas.qt_mat ?? 0}
        descricao={DESC_ATIV}
      />

      {!gratuito && (
        <>
          <div className="mb-[0.875rem] mt-6 flex items-center gap-[0.625rem]">
            <span className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
              Bolsas e financiamento
            </span>
            <div className="flex-1 h-[1.5px] bg-surface-deep"></div>
          </div>

          <ProfilePermanenciaFinancing
            tipo={'prouni'}
            valor={
              (metricas.qt_ing_prounii ?? 0) + (metricas.qt_ing_prounip ?? 0)
            }
            ingressantes={metricas.qt_ing ?? 0}
            integrais={metricas.qt_ing_prounii ?? 0}
            parciais={metricas.qt_ing_prounip ?? 0}
            descricao={DESC_PROUNI}
          />
          <ProfilePermanenciaFinancing
            tipo={'fies'}
            valor={metricas.qt_ing_fies ?? 0}
            ingressantes={metricas.qt_ing ?? 0}
            descricao={DESC_FIES}
          />

          <Callout v="module" className="text-fg-muted">
            <strong className="text-fg">Bolsa não é financiamento.</strong> Uma
            bolsa não é devolvida — mas pode não cobrir tudo: o ProUni integral
            cobre a mensalidade inteira, enquanto o parcial cobre 50%, e o
            restante fica por conta do estudante. Um financiamento (como o Fies)
            é um valor emprestado que você devolve depois, com juros. Vale
            entender a diferença antes de decidir.
          </Callout>

          <Callout v="module" className="text-fg-muted mt-2">
            <span className="flex items-start gap-2">
              <LifeBuoy className="mt-[1.5px] shrink-0 size-3.5" />
              <span>
                <strong className="text-fg">Financiamento é dívida.</strong>{' '}
                Antes de assinar, veja juros, prazo e o valor total a pagar.
              </span>
            </span>
          </Callout>

          <Callout v="module" className="text-fg-muted mt-2">
            <strong className="text-fg">
              Existem outras formas de financiamento ou custeio
            </strong>
            , sujeitas ao mercado de financiamentos privados. ProUni e Fies são iniciativas públicas.
          </Callout>
        </>
      )}

      <div className="mb-[0.875rem] mt-6 flex items-center gap-[0.625rem]">
        <span className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
          Reserva de vagas · cotas
        </span>
        <div className="flex-1 h-[1.5px] bg-surface-deep"></div>
      </div>

      <ProfilePermanenciaFinancing
        tipo={'cotas'}
        valor={metricas.qt_ing_reserva_vaga ?? 0}
        ingressantes={metricas.qt_ing ?? 0}
        descricao={DESC_COTAS}
      />

      <Profile.Section title="Continue sua rota" className="px-0">
        <Route
          module="4"
          variant="inline"
          href={iesHref}
          title="Conheça a instituição"
          description="Indicadores e perfil da universidade — Telescópio"
        />
      </Profile.Section>
    </Profile>
  )
}
