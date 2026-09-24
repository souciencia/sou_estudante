import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { cn } from '@/utils/cn'

export interface ProfileCursosRetentionCardProps {
  taxa?: number
  mediaBrasil?: number
  anoInicio?: number
  anoFim?: number
  onComparar?: () => void
  className?: string
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`

/**
 * Card de desistência acumulada do curso, com barra e marcador da média nacional.
 */
export const ProfileCursosRetentionCard = ({
  taxa,
  mediaBrasil,
  anoInicio,
  anoFim,
  onComparar,
  className,
}: ProfileCursosRetentionCardProps) => {
  const hasTaxa = typeof taxa === 'number'
  const coorte =
    anoInicio !== undefined && anoFim !== undefined
      ? `ingressantes de ${anoInicio} acompanhados até ${anoFim}`
      : undefined

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-card border border-card-border bg-card-surface px-6 py-6 shadow',
        className,
      )}
    >
      <div className="flex items-end justify-between gap-4">
        <span className="font-coadjuvant text-coadjuvant font-bold uppercase tracking-wide text-fg-coadjuvant">
          Desistência acumulada — 5 anos
        </span>
        <span className="font-title-protagonist text-protagonist-xl font-bold leading-none text-fg-protagonist">
          {hasTaxa ? formatPercent(taxa) : '—'}
        </span>
      </div>

      <div className="relative h-3 w-full rounded-full bg-progress-bar-background">
        {hasTaxa && (
          <div
            className="h-full rounded-full bg-progress-bar-foreground"
            style={{ width: `${clampPercent(taxa)}%` }}
          />
        )}
        {mediaBrasil !== undefined && (
          <span
            className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-fg-protagonist"
            style={{ left: `${clampPercent(mediaBrasil)}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 font-protagonist text-protagonist-sm text-fg-protagonist">
        <span>
          Este curso:{' '}
          <strong className="font-bold">
            {hasTaxa ? formatPercent(taxa) : '—'}
          </strong>
        </span>
        {mediaBrasil !== undefined && (
          <span className="text-fg-muted">
            Média Brasil:{' '}
            <strong className="font-bold text-fg-protagonist">
              {formatPercent(mediaBrasil)}
            </strong>
          </span>
        )}
        {coorte && (
          <span className="text-fg-muted">
            Coorte:{' '}
            <strong className="font-bold text-fg-protagonist">{coorte}</strong>
          </span>
        )}
      </div>

      {coorte && (
        <p className="font-coadjuvant text-coadjuvant-sm text-fg-muted">
          Base de Fluxo/INEP, coorte {anoInicio}–{anoFim}
        </p>
      )}

      <hr className="border-dashed border-card-border" />

      <p className="font-protagonist text-protagonist text-fg-protagonist">
        A taxa varia muito conforme a área. Ela ganha sentido lado a lado com
        cursos parecidos — Pedagogia com Pedagogia, Medicina com Medicina.
      </p>

      <Button
        v="outline"
        module="5"
        onClick={onComparar}
        className="self-start px-5 py-2"
      >
        Comparar com outros cursos
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  )
}
