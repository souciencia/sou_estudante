import { Info } from 'lucide-react'
import { Tag } from '@/components/ui/tag/tag'

interface ProfilePermanenciaSupportProps {
  titulo: string
  valor: number
  matriculados: number
  descricao: string
}

export const ProfilePermanenciaSupport = ({
  titulo,
  valor,
  matriculados,
  descricao,
}: ProfilePermanenciaSupportProps) => {
  return (
    <div className="mb-3 rounded-card border border-border-secondary bg-surface-lv2 p-[1.125rem]">
      <div className="mb-[0.625rem] flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-fg">{titulo}</p>
        <Tag
          label={'PERMANÊNCIA'}
          module={'2'}
          className="border-none bg-accent/20 font-bold text-accent-deep/80 py-[2px] text-2xs"
        />
      </div>

      {valor === 0 ? (
        <div className="mb-[0.375rem] text-sm font-semibold text-fg-muted">
          Nenhum beneficiário registrado em 2024
        </div>
      ) : (
        <div className="mb-2 font-mono text-xl font-bold leading-none text-fg">
          {valor}{' '}
          <small className="font-sans text-xs font-medium text-fg-muted">
            de {matriculados} matriculados
          </small>
        </div>
      )}

      <p className="mb-1 text-xs leading-[1.55] text-fg-muted">{descricao}</p>
      <div className="mt-2 flex items-center gap-[6px] text-2xs text-fg-muted">
        <Info className="size-3" />
        Censo · 2024
      </div>
    </div>
  )
}
