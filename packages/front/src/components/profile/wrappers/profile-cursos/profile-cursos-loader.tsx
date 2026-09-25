'use client'

import Link from 'next/link'
import { ErrorMessage } from '@/components/ui/error-message'
import { Spinner } from '@/components/ui/spinner'
import { Typo } from '@/components/ui/typo'
import { useCurso } from '@/services/api/use-curso'
import { ProfileCursos } from './profile-cursos'

interface ProfileCursosLoaderProps {
  id: string
}

export const ProfileCursosLoader = ({ id }: ProfileCursosLoaderProps) => {
  const { curso, isLoading, error, notFound } = useCurso(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Typo v="title" s="2xl" t="h1" className="block">
          Curso não encontrado
        </Typo>
        <Typo v="mute" s="sm" t="p" className="mt-2 cursor-auto">
          O curso que você procura não existe ou foi removido.
        </Typo>
        <Link
          href="/cursos"
          className="mt-6 inline-block rounded-full border border-accent px-5 py-2 font-coadjuvant text-coadjuvant font-bold text-accent-deep transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          Voltar à busca
        </Link>
      </div>
    )
  }

  if (error || !curso) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorMessage message={error ?? 'Não foi possível carregar o curso.'} />
      </div>
    )
  }

  return <ProfileCursos curso={curso} />
}
