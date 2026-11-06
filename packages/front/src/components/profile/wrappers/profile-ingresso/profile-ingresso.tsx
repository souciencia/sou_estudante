import { Info, MapPin } from 'lucide-react'
import { Callout } from '@/components/ui/callout'
import { Route } from '@/components/ui/route/route'
import { Tag } from '@/components/ui/tag/tag'
import type { Module } from '@/lib/module'
import { buildIesHref } from '@/lib/profile-links'
import type { Curso, Oferta } from '@/services/api'
import { Profile } from '../..'
import { ProfileIngressoShift } from './profile-ingresso-shift'

interface ProfileIngressoProps {
  curso: Curso
  module?: Module
}

type OfertasPorTurno = {
  [turno: string]: Oferta[]
}

export const ProfileIngresso = ({
  curso,
  module = '2',
}: ProfileIngressoProps) => {
  const nomeCurso = curso.curso?.no_curso ?? 'Curso não especificado'
  const grau = curso.curso?.no_grau_academico
  const titulo = grau ? `${nomeCurso} — ${grau}` : nomeCurso
  const subtitulo = curso.instituicao?.sg_ies !== 'INEXISTENTE' 
    ? [curso.instituicao?.no_ies, curso.instituicao?.sg_ies].filter(Boolean).join(' · ') 
    : curso.instituicao?.no_ies || undefined
  const cidade = curso.localizacao?.no_municipio
  const uf = curso.localizacao?.sg_uf
  const ofertas = curso.sisu?.ofertas ?? []
  const id = curso.sequencial
  const permanenciaHref = id !== undefined ? `/permanencia/${id}` : undefined
  const idIes = curso.instituicao.co_ies
  const iesHref = idIes !== undefined ? buildIesHref(idIes, id) : undefined
  const temSisu = curso.sisu?.tem_sisu ?? false
  const nomeIes = curso.instituicao?.no_ies

  if (!temSisu) {
    return (
      <Profile module={module} className="p-4" courseId={id} iesId={idIes}>
        <Profile.Header
          badge="Ingresso pelo Sisu"
          title={titulo}
          subtitle={subtitulo}
          className="px-0"
        >
          <Tag label="Sem Sisu" variant="blue" className="text-2xs py-[2px]" />
        </Profile.Header>

        <Callout v="blue">
          <Callout.Header>
            <Callout.Icon>
              <Info aria-hidden="true" />
            </Callout.Icon>
            <Callout.HeaderContent>
              <Callout.Tagline>Para você, estudante</Callout.Tagline>
              <Callout.Title>
                O curso não possui ingresso por Sisu
              </Callout.Title>
            </Callout.HeaderContent>
          </Callout.Header>
          <Callout.Content>
            <p>
              Esta oferta não participa do Sisu. Isso não significa que não dá
              para entrar: a instituição pode selecionar estudantes por
              vestibular próprio, Enem direto, histórico escolar ou outro
              processo seletivo.
            </p>
            <p>
              Para saber como ingressar, consulte o site da instituição
              {nomeIes ? (
                <>
                  {' '}
                  — <strong>{nomeIes}</strong>
                </>
              ) : null}
              . Lá estão as informações oficiais e atualizadas sobre o processo
              seletivo.
            </p>
          </Callout.Content>
        </Callout>
      </Profile>
    )
  }

  const ofertasPorTurno = ofertas.reduce<OfertasPorTurno>((dic, oferta) => {
    const turno = oferta.turno || 'OUTROS'

    if (!dic[turno]) dic[turno] = []

    dic[turno].push(oferta)
    return dic
  }, {})

  const turnosUnicos = Object.keys(ofertasPorTurno)

  return (
    <Profile module={module} className="p-4" courseId={id} iesId={idIes}>
      <Profile.Header
        badge={'Ingresso pelo Sisu'}
        title={titulo}
        subtitle={subtitulo}
        className="px-0"
      >
        <Tag
          label={'Com vagas no Sisu'}
          module={module}
          className="text-2xs py-[2px] bg-accent/10 border-accent/30"
          variant="module"
        />
        {turnosUnicos.map((turno) => (
          <Tag key={turno} label={turno} className="text-2xs py-[2px]" />
        ))}
        {cidade && (
          <Tag label={`${cidade}, ${uf}`} className="text-2xs py-[2px]" />
        )}
      </Profile.Header>

      {cidade && (
        <Profile.Location
          icon={<MapPin className="size-4" />}
          eyebrow="Local de oferta"
          value={cidade}
          source="Sisu · 2026"
          tag={uf}
          module={module}
          variant={true}
          className="mb-4"
        />
      )}

      {/* Card de ofertas agrupadas por turno */}
      {Object.entries(ofertasPorTurno).map(([turno, listaDeOfertas]) => {
        const temMaisDeUmTurno = Object.keys(ofertasPorTurno).length > 1

        return (
          <div key={turno} className="mb-4">
            {temMaisDeUmTurno && (
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.6px] text-fg-muted">
                Turno: {turno}
              </div>
            )}

            <ProfileIngressoShift ofertas={listaDeOfertas} />
          </div>
        )
      })}

      <span className="mt-3 flex items-start gap-2 px-1 text-xs leading-[1.6] text-fg-muted">
        &ldquo;Escola pública&rdquo; inclui escolas comunitárias de educação do
        campo conveniadas com o poder público. &ldquo;Baixa renda&rdquo; é renda
        familiar de até 1 salário mínimo por pessoa. Modalidades definidas pela
        Lei de Cotas (Lei nº 12.711/2012); reservas de vagas e bônus próprios
        são políticas de cada instituição.
      </span>

      <Callout v="module" className="mt-5 text-xs">
        A nota de corte que você está vendo é da plataforma Sisu — e é da{' '}
        <strong>primeira chamada</strong>. As universidades fazem várias
        chamadas e esta nota <strong>tende a cair</strong>: portanto, fique
        atento!
        <br />
        Se sua nota estiver próxima, vale acompanhar até o fim:{' '}
        <strong>a lista de espera também resulta em matrículas.</strong>
      </Callout>

      <Callout v="gold" className="mt-3 text-xs">
        <strong>Prazos valem vaga.</strong> Inscrição, chamadas e matrícula têm
        datas definidas no edital de cada universidade — perder um prazo pode
        significar perder a vaga. Leia o edital e acompanhe o processo até o
        fim.
      </Callout>

      {/* Mesmo Curso em outros locais */}

      <Profile.Section title="Continue sua rota" className="mt-1 px-0">
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
