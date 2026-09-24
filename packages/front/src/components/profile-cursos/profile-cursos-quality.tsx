import { TrendingUp } from 'lucide-react'
import { Callout } from '@/components/callout/callout'
import MarLegenda from '@/components/formas-enade/mar-jegenda'
import SeloEnade from '@/components/selo-enade/selo-enade'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'
import { cn } from '@/utils/cn'
import { ProfileCursosRetentionCard } from './profile-cursos-retention-card'

interface ProfileCursosQualityProps {
  curso: Curso
  module?: Module
  className?: string
}

type FaixaEnade = 1 | 2 | 3 | 4 | 5 | 'SC' | null

const resolveFaixa = (raw?: string): FaixaEnade => {
  if (!raw) return null
  const normalized = raw.toString()
  const numerica = Number.parseInt(normalized, 10)
  if (numerica >= 1 && numerica <= 5) {
    return numerica as 1 | 2 | 3 | 4 | 5
  }
  return normalized.toUpperCase() === 'SC' ? 'SC' : null
}

/**
 * Aba "Qualidade" do perfil de curso: selo do Enade, legenda de leitura e
 * desistência acumulada.
 */
export const ProfileCursosQuality = ({
  curso,
  module,
  className,
}: ProfileCursosQualityProps) => {
  const faixa = resolveFaixa(curso.enade?.conceito_faixa_enade)
  const ano = curso.enade?.ano_enade

  return (
    <div data-module={module} className={cn('flex flex-col gap-6', className)}>
      <section className="flex flex-col gap-3">
        <span className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-fg-muted">
          Conceito Enade
        </span>

        <div className="flex items-start gap-4">
          <SeloEnade faixa={faixa} tamanho="detalhe" />
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-coadjuvant text-coadjuvant-xs font-bold uppercase tracking-wide text-fg-muted">
              Ciclo avaliativo
            </span>
            <span className="font-title-protagonist text-protagonist-lg font-bold text-fg-protagonist">
              {ano ?? '—'}
            </span>
            <p className="font-protagonist text-protagonist text-fg-protagonist">
              Nota oficial mais recente para este curso, na escala de 1 a 5.
            </p>
            <span className="font-coadjuvant text-coadjuvant-sm text-fg-muted">
              Fonte: Inep · Enade {ano ?? '—'}
            </span>
          </div>
        </div>

        <MarLegenda />
      </section>

      <Callout v="info">
        O conceito Enade é avaliado por ciclos — nem todos os cursos são
        avaliados no mesmo ano. Áreas de saúde, exatas e humanidades têm
        calendários distintos.
      </Callout>

      <Callout v="future">
        <span className="inline-flex items-center gap-2">
          <TrendingUp className="size-5 shrink-0" aria-hidden="true" />
          Em versões futuras: a progressão das notas ao longo dos ciclos, para
          ler tendências de avaliação.
        </span>
      </Callout>

      <ProfileCursosRetentionCard
        taxa={curso.tda?.tda}
        anoInicio={curso.tda?.nu_ano_ingresso_tda}
        anoFim={curso.tda?.nu_ano_referencia_tda}
      />
    </div>
  )
}
