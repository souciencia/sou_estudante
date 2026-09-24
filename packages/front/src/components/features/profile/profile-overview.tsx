import { cn } from '@/utils/cn'

export interface OverviewItem {
  label: string
  value?: string
  note?: string
}

export interface ProfileOverviewProps {
  items: OverviewItem[]
  className?: string
}

/**
 * Lista de atributos rótulo/valor do Profile. Itens sem valor são omitidos.
 */
export function ProfileOverview({ items, className }: ProfileOverviewProps) {
  const visible = items.filter((item) => Boolean(item.value))
  if (visible.length === 0) {
    return null
  }

  return (
    <dl className={cn('flex flex-col gap-3', className)}>
      {visible.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between gap-4 rounded-[20px] border border-card-border bg-card-surface px-5 py-4"
        >
          <dt className="font-protagonist text-protagonist text-fg-muted">
            {item.label}
          </dt>
          <dd className="text-right font-title-protagonist text-protagonist font-bold text-fg-protagonist">
            {item.value}
            {item.note && (
              <span className="ml-1 font-coadjuvant text-coadjuvant font-normal text-fg-muted">
                · {item.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
