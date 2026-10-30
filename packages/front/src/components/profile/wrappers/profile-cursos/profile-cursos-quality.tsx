'use client';

import { TrendingUp } from 'lucide-react'
import { MarLegenda } from '@/components/enade/formas-enade/mar-legenda'
import { SeloEnade } from '@/components/enade/selo-enade/selo-enade'
import { Callout } from '@/components/ui/callout'
import { parseEnadeLevel } from '@/lib/enade'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'
import { cn } from '@/utils/cn'
import { ProfileCursosRetentionCard } from './profile-cursos-retention-card'
import { useParams, useRouter } from 'next/navigation'
import { MAX_COMPARE, useCompareCursos } from '@/components/compare/compare-provider'

interface ProfileCursosQualityProps {
  curso: Curso
  module?: Module
  className?: string
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
  const faixa = parseEnadeLevel(curso.enade?.conceito_faixa_enade)
  const ano = curso.enade?.ano_enade

  const { ids, isComparing, isSelected, toggle, setComparing } = useCompareCursos()
  const selectionFull = ids.length >= MAX_COMPARE

  const params = useParams();
  const id = String(params.id)
  
  const router = useRouter()
  
  const handleSubmit = (value: string) => {
    if(!isSelected(id) && !selectionFull){
      toggle(id)
      
      if(!isComparing) {
        setComparing(true)
      }
    }

    const params = new URLSearchParams({ q: value })
    router.push(`/cursos?${params.toString()}`)
  }


  return (
    <div
      data-module={module}
      className={cn('flex flex-col gap-6 p-4', className)}
    >
      <section className="flex flex-col gap-3">
        <span className="font-sans text-xs font-bold uppercase tracking-wide text-fg-muted">
          Conceito Enade
        </span>

        <div className="flex items-start gap-4">
          <SeloEnade level={faixa} size="lg" />
          <div className="flex flex-1 flex-col gap-1">
            <span className="font-sans text-xs font-bold uppercase tracking-wide text-fg-muted">
              Ciclo avaliativo
            </span>
            <span className="font-sans text-base font-bold text-fg">
              {ano ?? '—'}
            </span>
            <p className="font-sans text-xs text-fg-muted">
              Nota oficial mais recente para este curso, na escala de 1 a 5.
            </p>
            <span className="font-sans text-xs text-fg-muted">
              Fonte: Inep · Enade {ano ?? '—'}
            </span>
          </div>
        </div>

        <MarLegenda />
      </section>

      <Callout v="blue">
        O conceito Enade é avaliado por ciclos — nem todos os cursos são
        avaliados no mesmo ano. Áreas de saúde, exatas e humanidades têm
        calendários distintos.
      </Callout>

      <Callout v="blue">
        <span className="inline-flex gap-2">
          <TrendingUp
            className="size-3 scale-125 translate-y-0.5"
            aria-hidden="true"
          />
          Em versões futuras: a progressão das notas ao longo dos ciclos, para
          ler tendências de avaliação.
        </span>
      </Callout>

      <ProfileCursosRetentionCard
        taxa={curso.tda?.tda}
        anoInicio={curso.tda?.nu_ano_ingresso_tda}
        anoFim={curso.tda?.nu_ano_referencia_tda}
        onComparar={() => handleSubmit(curso.curso.no_curso ?? "")}
      />
    </div>
  )
}
