import { cn } from '@/utils/cn'

interface ProfileIngressoQuotasProps {
  nome: string | undefined
  descricao?: string | undefined
  vagas: number | undefined
  nota: number | undefined
}

const formatNotaCorte = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`

export const ProfileIngressoQuotas = ({
  nome,
  descricao,
  vagas,
  nota,
}: ProfileIngressoQuotasProps) => {
  const vazia = nota === null || nota === undefined
  const semNota = nota === 0
  const texto = semNota ? 'sem nota nesta chamada' : null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-panel border p-3',
        vazia
          ? 'border-dashed border-border-secondary bg-surface-lv1'
          : 'border-border-secondary bg-surface-lv2',
      )}
    >
      <div>
        <div className="mb-px text-xs font-bold text-fg">{nome}</div>
        {descricao && <div className="text-2xs text-fg-muted">{descricao}</div>}
      </div>

      <div className="text-right">
        <span className="font-mono text-base font-bold text-fg">
          {nota ? formatNotaCorte(nota) : '—'}
        </span>

        {nome === 'Bônus da instituição' && (
          <div className="text-2xs text-fg-muted">
            Nota da ampla concorrência — o bônus é aplicado à nota do estudante
          </div>
        )}

        {nome !== 'Bônus da instituição' && !vazia && typeof vagas === 'number' && (
          <div className="font-mono text-2xs text-fg-muted">
            {vagas} {vagas === 1 ? 'vaga' : 'vagas'}
          </div>
        )}
        {texto && <div className="text-2xs text-text-muted">{texto}</div>}
      </div>
    </div>
  )
}
