import type { EnadeFaixa } from '@/lib/enade'
import { cn } from '@/utils/cn'

interface Props {
  n: EnadeFaixa
  className?: string
}

const variants: Record<EnadeFaixa, string> = {
  1: 'bg-enade-low-surface text-enade-low',
  2: 'bg-enade-low-surface text-enade-low',
  3: 'bg-enade-warn-surface text-enade-warn',
  4: 'bg-enade-ok-surface text-enade-ok',
  5: 'bg-enade-ok-surface text-enade-ok',
}

export const CardIconEnade = ({ n, className }: Props) => {
  return (
    <div
      className={cn(
        'flex size-10 flex-col items-center justify-center rounded-[8px] font-protagonist',
        variants[n],
        className,
      )}
    >
      <span className="text-protagonist-lg font-bold">{n}</span>
      <span className="-translate-y-1 text-coadjuvant-xs font-bold">Enade</span>
    </div>
  )
}
