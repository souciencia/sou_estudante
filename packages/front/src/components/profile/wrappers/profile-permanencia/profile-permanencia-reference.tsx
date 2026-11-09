import { UsersRound } from 'lucide-react'

interface ProfilePermanenciaReferenceProps {
  ingressantes: number
  matriculados: number
}

export const ProfilePermanenciaReference = ({
  ingressantes,
  matriculados,
}: ProfilePermanenciaReferenceProps) => {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-card border border-border-secondary bg-surface-lv2 p-4">
      <UsersRound className="text-accent-deep size-4" aria-hidden="true" />
      <div>
        <h3 className="mb-[1px] text-2xs font-bold uppercase tracking-[0.5px] text-accent-deep">
          Estudantes de referência
        </h3>
        <h4 className="text-base font-bold text-fg">
          <span className="text-accent-deep/90">{ingressantes}</span>{' '}
          ingressantes ·{' '}
          <span className="text-accent-deep/90">{matriculados}</span>{' '}
          matriculados em 2024
        </h4>
        <p className="mt-[2px] text-2xs text-fg-muted">
          Bolsas e cotas usam os ingressantes como base; apoio social e
          atividade extracurricular, os matriculados · Censo · 2024
        </p>
      </div>
    </div>
  )
}
