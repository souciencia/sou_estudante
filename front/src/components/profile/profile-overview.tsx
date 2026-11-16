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
          className="mb-2 flex items-center justify-between rounded-panel border border-border-secondary bg-surface-lv2 px-4 py-3"
        >
          <dt className="font-sans text-xs text-fg-muted">{item.label}</dt>
          <dd className="text-right font-sans text-sm font-semibold text-fg">
            {item.value}
            {item.note && (
              <span className="ml-1 font-sans text-xs text-fg-muted">
                · {item.note}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
