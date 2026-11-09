import { Tag } from '@/components/ui/tag/tag'
import { modalidadePorExtensao } from '@/lib/sisu'
import type { Oferta } from '@/services/api'
import { ProfileIngressoQuotas } from './profile-ingresso-quotas'

interface ProfileIngressoShiftProps {
  ofertas: Oferta[]
}

const formatNotaCorte = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`

const formatarTurno = (turno?: string) => {
  if (!turno) return ''
  return turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase()
}

export const ProfileIngressoShift = ({
  ofertas,
}: ProfileIngressoShiftProps) => {
  if (ofertas.length === 0) return null

  const ampla = ofertas[0]
  const cotas = ofertas.filter((o) => o.modalidade !== 'AC')

  return (
    <article className="relative overflow-hidden rounded-card border-[1.5px] border-border-secondary bg-surface-lv2 p-4 sm:p-[1.125rem]">
      <div className="mb-[0.875rem] rounded-card border-[1.5px] border-border-secondary bg-surface-lv2 p-5">
        <div className="mb-1 text-2xs font-bold uppercase tracking-[0.6px] text-fg-muted">
          Nota de corte · Chamada regular · Ampla concorrência
        </div>

        <div className="mb-1">
          <span className="font-mono text-4xl font-bold leading-none text-fg">
            {ampla.nota_corte ? formatNotaCorte(ampla.nota_corte) : '—'}
            {ampla.nota_corte && (
              <small className="font-sans text-sm font-normal text-fg-muted">
                {' '}
                pts
              </small>
            )}
          </span>
        </div>

        <div className="text-2xs text-fg-muted">
          Último classificado · 1ª chamada
        </div>

        <div className="mt-[10px]">
          <Tag
            label={'Sisu'}
            module={'2'}
            className="py-[2px] font-normal bg-accent/10 border-accent/30 text-2xs"
            variant="module"
          />
        </div>
      </div>

      <div className="mb-[0.875rem] grid grid-cols-1 gap-[0.625rem] sm:grid-cols-2">
        <div className="rounded-panel border border-border-secondary bg-surface-lv2 p-[0.875rem]">
          <div className="mb-1 text-2xs font-bold uppercase tracking-[0.6px] text-fg-muted">
            Vagas ofertadas
          </div>
          <div className="font-mono text-xl font-bold leading-none text-fg">
            {ampla.vagas !== null && ampla.vagas !== undefined
              ? ampla.vagas
              : '—'}
          </div>
          <div className="mt-[3px] text-2xs text-fg-muted">
            Ampla concorrência · 2026
          </div>
        </div>

        <div className="rounded-panel border border-border-secondary bg-surface-lv2 p-[0.875rem]">
          <div className="mb-1 text-2xs font-bold uppercase tracking-[0.6px] text-fg-muted">
            Turno · Sisu
          </div>
          <div className="pt-1 text-base font-bold text-fg">
            {formatarTurno(ampla.turno)}
          </div>
        </div>
      </div>

      {cotas.length > 0 && (
        <>
          <div className="mb-[10px] mt-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-surface-deep" />
            <div className="whitespace-nowrap text-2xs font-bold uppercase tracking-[0.7px] text-fg-muted">
              Modalidades de concorrência — Sisu
            </div>
            <div className="h-px flex-1 bg-surface-deep" />
          </div>

          <div className="mb-[0.875rem] flex flex-col gap-2">
            {cotas.map((o) => {
              const { nome, descricao } = modalidadePorExtensao(o)

              return (
                <ProfileIngressoQuotas
                  key={`${o.modalidade}-${o.turno}`}
                  nome={nome}
                  descricao={descricao ?? ''}
                  vagas={o.vagas}
                  nota={o.nota_corte}
                />
              )
            })}
          </div>
        </>
      )}

      {/*<footer className="flex items-center justify-between gap-2 border-t border-border-secondary pt-2">
        <Tag
          label={'Sisu'}
          module={'2'}
          className="py-[2px] font-normal bg-accent/15 border-accent/40 text-2xs"
          variant="module"
        />
        <Button
          v="outline"
          module={'2'}
          className="inline-flex cursor-pointer items-center gap-[5px] rounded-control border-[1.5px] px-3 py-[6px] font-sans text-2xs font-semibold transition-transform duration-fast ease-prow active:scale-[0.97] mt-1 bg-accent/10"
        >
          <Info className="size-3" aria-hidden="true" />
          Como interpretar?
        </Button>
      </footer>*/}
    </article>
  )
}
