// components/SearchResultList.tsx
import { SkeletonCard } from '@/components/molecules/card/skeleton-card'
import { ErrorMessage } from '@/components/atoms/error-message'
import { Typo } from '@/components/atoms/typo'
import type { OfertaCompleta, PaginationLinks } from '@/services/api/types'
import { Pagination } from './search-pagination'
import SearchResultItem from './search-result-item'

interface SearchResultListProps {
  cursos: OfertaCompleta[]
  isLoading?: boolean
  error?: string | null
  total?: number
  currentPage?: number
  limit?: number
  links?: PaginationLinks | null
  onNavigate?: (url: string) => void
}

export default function SearchResultList({
  cursos,
  isLoading,
  error,
  total = 0,
  currentPage = 1,
  limit = 20,
  links,
  onNavigate,
}: SearchResultListProps) {
  // Loading
  if (isLoading) {
    return (
      <div className="grid gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  // Error
  if (error) {
    return <ErrorMessage message={error} />
  }

  // Empty
  if (!cursos || cursos.length === 0) {
    return (
      <div className="text-center py-8">
        <Typo v="mute" s="sm" t="p" className="cursor-auto">
          Nenhum curso encontrado
        </Typo>
      </div>
    )
  }

  // Results
  return (
    <div className="space-y-4">
      <Typo v="mute" s="sm" t="p" className="cursor-auto">
        {total > 0
          ? `${total} ${total === 1 ? 'curso' : 'cursos'} encontrado${total === 1 ? '' : 's'}`
          : `${cursos.length} ${cursos.length === 1 ? 'curso' : 'cursos'}`}
      </Typo>
      <div className="grid gap-4">
        {cursos.map((curso, index) => {
          // Gerar key única usando sequencial ou combinação de campos
          const key = curso.sequencial
            ? `seq-${curso.sequencial}`
            : `${curso.instituicao?.co_ies}-${curso.curso?.co_curso}-${index}`

          return <SearchResultItem key={key} oferta={curso} />
        })}
      </div>

      {links && onNavigate && (
        <Pagination
          links={links}
          currentPage={currentPage}
          total={total}
          limit={limit}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}
