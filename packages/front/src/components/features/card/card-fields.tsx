import { cn } from '@/utils/cn'

export interface CardField {
  label: string
  value?: string
}

interface Props {
  items: CardField[]
  className?: string
}

/**
 * Lista de pares rótulo/valor de um Card (agnóstica de domínio).
 * Campos sem valor são omitidos.
 */
export const CardFields = ({ items, className }: Props) => {
  const visible = items.filter((item) => Boolean(item.value))
  if (visible.length === 0) {
    return null
  }

  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-6 gap-y-1 py-1 sm:grid-cols-2',
        className,
      )}
    >
      {visible.map((item) => (
        <div key={item.label} className="flex gap-1">
          <dt className="font-coadjuvant text-coadjuvant-sm text-fg-muted">
            {item.label}:
          </dt>
          <dd className="font-protagonist text-protagonist-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
