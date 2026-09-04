import { Typo } from '@/components/atoms/typo'
import type { PaginationLinks } from '@/services/api/types'
import { cn } from '@/utils/cn'

interface PaginationProps {
  links: PaginationLinks
  currentPage: number
  total: number
  limit: number
  onNavigate: (url: string) => void
  className?: string
}

export function Pagination({
  links,
  currentPage,
  total,
  limit,
  onNavigate,
  className,
}: PaginationProps) {
  if (total === 0) return null

  // Calcular total de páginas
  const totalPages = Math.ceil(total / limit)

  return (
    <nav
      className={cn('flex items-center justify-between gap-4 py-4', className)}
      aria-label="Navegação de páginas"
    >
      <div className="flex gap-2">
        <PaginationButton
          onClick={() => onNavigate(links.first)}
          disabled={!links.prev}
          label="Primeira"
          ariaLabel="Ir para primeira página"
        />
        <PaginationButton
          onClick={() => links.prev && onNavigate(links.prev)}
          disabled={!links.prev}
          label="Anterior"
          ariaLabel="Ir para página anterior"
        />
      </div>

      <Typo v="mute" s="sm" t="span" className="cursor-auto">
        Página {currentPage} de {totalPages}
      </Typo>

      <div className="flex gap-2">
        <PaginationButton
          onClick={() => links.next && onNavigate(links.next)}
          disabled={!links.next}
          label="Próxima"
          ariaLabel="Ir para próxima página"
        />
        <PaginationButton
          onClick={() => onNavigate(links.last)}
          disabled={!links.next}
          label="Última"
          ariaLabel="Ir para última página"
        />
      </div>
    </nav>
  )
}

interface PaginationButtonProps {
  onClick: () => void
  disabled: boolean
  label: string
  ariaLabel: string
}

function PaginationButton({
  onClick,
  disabled,
  label,
  ariaLabel,
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        disabled
          ? 'cursor-not-allowed bg-gray-100 text-gray-400'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600',
      )}
    >
      <Typo v={disabled ? 'mute' : 'normal'} s="sm" t="span">
        {label}
      </Typo>
    </button>
  )
}
