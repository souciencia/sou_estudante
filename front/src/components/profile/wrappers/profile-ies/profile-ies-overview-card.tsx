interface ProfileIESOverviewCardProps {
  valor: number | null
  descricao: string
}

const num = new Intl.NumberFormat('pt-BR')

export const ProfileIESOverviewCard = ({
  valor,
  descricao,
}: ProfileIESOverviewCardProps) => {
  return (
    <div className="rounded-panel border border-border-secondary bg-white px-[0.625rem] py-3 text-center">
      <div className="font-mono text-xl font-bold leading-tight text-fg">
        {valor == null ? '—' : num.format(valor)}
      </div>
      <div className="mt-[2px] text-2xs leading-[1.45] text-fg-muted">
        {descricao}
      </div>
    </div>
  )
}
