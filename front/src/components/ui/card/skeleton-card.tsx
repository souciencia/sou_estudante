import { cn } from '@/utils/cn'

type SkeletonCardProps = {
  className?: string
}

/**
 * Componente SkeletonCard - Placeholder animado para cards de cursos
 * Usado durante o loading para melhor UX
 *
 * @example
 * {isLoading && (
 *   <>
 *     <SkeletonCard />
 *     <SkeletonCard />
 *     <SkeletonCard />
 *   </>
 * )}
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-card border border-border-primary bg-surface-lv2 p-4 shadow',
        className,
      )}
      aria-hidden="true"
    >
      {/* Título do curso */}
      <div className="mb-3 h-5 w-3/4 rounded bg-muted" />

      {/* Instituição */}
      <div className="mb-2 h-4 w-1/2 rounded bg-muted" />

      {/* Informações adicionais */}
      <div className="flex gap-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
      </div>
    </div>
  )
}
