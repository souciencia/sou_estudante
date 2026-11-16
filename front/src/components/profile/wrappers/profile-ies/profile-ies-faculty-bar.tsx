interface ProfileIESFacultyBarProps {
  rotulo: string
  percentual: number | undefined
  mediaPorCurso: number | undefined
}

const percent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export const ProfileIESFacultyBar = ({
  rotulo,
  percentual,
  mediaPorCurso,
}: ProfileIESFacultyBarProps) => {
  const escala = percentual === undefined ? 0 : percentual / 100

  return (
    <div className="mb-[0.875rem] last:mb-0">
      <div className="mb-[0.375rem] flex items-baseline justify-between">
        <span className="text-xs font-semibold text-fg">{rotulo}</span>
        <span className="font-mono text-xs font-bold text-m4-deep">
          {percentual === undefined ? '—' : `${percent.format(percentual)}%`}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-[4px] bg-border-secondary">
        <div
          className="h-full w-full origin-left rounded-[4px] bg-m4-accent transition-transform duration-cruise ease-tide motion-reduce:transition-none"
          style={{ transform: `scaleX(${escala})` }}
        />
      </div>

      <div className="mt-1 text-2xs text-fg-muted">
        {mediaPorCurso === undefined
          ? '—'
          : `média de ${percent.format(mediaPorCurso)} docente${mediaPorCurso === 1 ? '' : 's'} com essa titulação por curso`}
      </div>
    </div>
  )
}
