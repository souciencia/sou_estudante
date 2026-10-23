import { Info } from 'lucide-react'
import { Callout } from '@/components/ui/callout'
import { ProfileIESOverviewCard } from './profile-ies-overview-card'

interface ProfileIESOverviewProps {
  matriculados: number | null
  qtd_cursos: number | null
  docentes: number | null
}

export const ProfileIESOverview = ({
  matriculados,
  qtd_cursos,
  docentes,
}: ProfileIESOverviewProps) => {
  return (
    <div className="px-4">
      <div className="grid grid-cols-3 gap-2">
        <ProfileIESOverviewCard
          valor={matriculados}
          descricao={'estudantes matriculados na graduação'}
        />
        <ProfileIESOverviewCard
          valor={qtd_cursos}
          descricao={'cursos de graduação ofertados'}
        />
        <ProfileIESOverviewCard
          valor={docentes}
          descricao={'docentes em exercício'}
        />
      </div>

      <div className="px-1 mt-2 flex items-center gap-[6px] text-2xs text-fg-muted">
        <Info className="size-3" />
        Censo · 2024
      </div>

      <Callout className="rounded-panel border-border-secondary bg-surface-lv1 text-2xs mt-2 text-fg-muted leading-[1.6]">
        <strong className="text-fg">
          Atenção: consulte o conceito Enade do seu curso.
        </strong>{' '}
        É o melhor indicador de qualidade disponível — e ele é do curso, não da
        instituição inteira. Você o encontra na tela de cada curso, na Carta
        Náutica.
      </Callout>
    </div>
  )
}
