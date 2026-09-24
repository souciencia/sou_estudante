'use client'

import Link from 'next/link'
import { ErrorMessage } from '@/components/atoms/error-message'
import { Spinner } from '@/components/atoms/spinner'
import { Typo } from '@/components/atoms/typo'
import { useIes } from '@/services/api/use-ies'
import { ProfileIES } from './profile-ies'

interface ProfileIESLoaderProps {
  id: string
}

export const ProfileIESLoader = ({ id }: ProfileIESLoaderProps) => {
  const { ies, isLoading, error, notFound } = useIes(id)

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
          Instituição não encontrada
        </Typo>
        <Typo v="mute" s="sm" t="p" className="mt-2 cursor-auto">
          A instituição que você procura não existe ou foi removida.
        </Typo>
        <Link
          href="/ies"
          className="mt-6 inline-block rounded-full border border-accent px-5 py-2 font-coadjuvant text-coadjuvant font-bold text-accent-deep transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
        >
          Voltar à busca
        </Link>
      </div>
    )
  }

  if (error || !ies) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorMessage
          message={error ?? 'Não foi possível carregar a instituição.'}
        />
      </div>
    )
  }

  return <ProfileIES ies={ies} />
}
