import Link from 'next/link'
import type { ReactNode } from 'react'
import { ErrorMessage } from '@/components/ui/error-message'
import { Spinner } from '@/components/ui/spinner'
import { Typo } from '@/components/ui/typo'

export interface ProfileLoaderProps<TData> {
  data: TData | null | undefined
  isLoading: boolean
  error: string | null
  notFound: boolean
  /** Título do estado "não encontrado" (ex.: "Curso não encontrado"). */
  notFoundTitle: string
  notFoundDescription: string
  /** Mensagem exibida quando há erro sem texto ou os dados vieram vazios. */
  fallbackError: string
  /** Destino do link "Voltar à busca" no estado "não encontrado". */
  backHref: string
  children: (data: TData) => ReactNode
}

/**
 * Estados de carregamento de uma página de perfil (spinner, 404 e erro),
 * agnóstico de domínio. O domínio entra por `data`, pelos textos e por
 * `children`, que só roda quando há dados.
 */
export function ProfileLoader<TData>({
  data,
  isLoading,
  error,
  notFound,
  notFoundTitle,
  notFoundDescription,
  fallbackError,
  backHref,
  children,
}: ProfileLoaderProps<TData>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl bg-surface-lv1 rounded-b-card shadw px-4 py-16">
        <div className="text-center">
          <Typo v="title" s="xl" t="h1" className="block">
            {notFoundTitle}
          </Typo>
          <Typo v="mute" s="sm" t="p" className="mt-2">
            {notFoundDescription}
          </Typo>
        </div>
        <div className="mt-6 text-center">
          <Link
            href={backHref}
            className="inline-block rounded-panel border border-accent-deep/80 bg-accent/30 px-5 py-2 font-sans text-sm font-bold text-accent-deep transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
          >
            Voltar à busca
          </Link>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl bg-surface-lv1 rounded-b-card shadw px-4 py-10">
        <ErrorMessage message={error ?? fallbackError} />
      </div>
    )
  }

  return <>{children(data)}</>
}
