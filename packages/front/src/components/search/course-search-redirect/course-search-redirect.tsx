'use client'

import { useRouter } from 'next/navigation'
import { SearchAutocompleteCursos } from '@/components/search/search-autocomplete/wrappers/search-autocomplete-cursos/search-autocomplete-cursos'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

export type CourseSearchRedirectTarget = 'ingresso' | 'permanencia'

export interface CourseSearchRedirectProps {
  title: string
  description?: string
  /** Origem da busca: define o perfil para onde o card do resultado aponta. */
  to: CourseSearchRedirectTarget
  module?: Module
  className?: string
}

/**
 * Bloco de entrada das páginas de módulo (Ingresso e Permanência): título,
 * texto de apoio e o autocomplete de cursos, que redireciona para a busca de
 * cursos (`/cursos?q=...&to=...`) preservando a origem.
 */
export function CourseSearchRedirect({
  title,
  description,
  to,
  module,
  className,
}: CourseSearchRedirectProps) {
  const router = useRouter()

  const handleSubmit = (value: string) => {
    const params = new URLSearchParams({ q: value, to })
    if (to === 'ingresso') {
      params.set('ingresso', 'sisu')
    }
    router.push(`/cursos?${params.toString()}`)
  }

  return (
    <section
      data-module={module}
      className={cn('flex flex-col gap-3', className)}
    >
      <h2 className="font-sans text-base font-bold tracking-tight text-fg">
        {title}
      </h2>
      {description && (
        <p className="font-sans text-sm text-fg-muted">{description}</p>
      )}
      <SearchAutocompleteCursos
        module={module}
        onSearchSubmit={handleSubmit}
        submitLabel="Buscar"
      />
    </section>
  )
}
