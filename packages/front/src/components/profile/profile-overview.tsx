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
    <dl className={className}>
      {visible.map((item) => (
        <div
          key={item.label}
          className="mb-2 flex items-center justify-between rounded-[14px] border border-plum-100 bg-card-surface px-4 py-3"
        >
          <dt className="font-protagonist text-xs text-text-muted">
            {item.label}
          </dt>
          <dd className="text-right font-protagonist text-coadjuvant font-semibold text-text">
            {item.value}
            {item.note && (
              <span className="ml-1 font-coadjuvant text-coadjuvant-xs text-text-muted">
                · {item.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
