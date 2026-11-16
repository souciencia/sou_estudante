'use client'

import { Button } from '@/components/ui/button/button'
import { ErrorMessage } from '@/components/ui/error-message'
import { Typo } from '@/components/ui/typo'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <Typo v="title" s="xl" t="h1" className="block">
        Algo deu errado
      </Typo>
      <Typo v="mute" s="sm" t="p" className="mt-2">
        Não foi possível carregar esta página agora.
      </Typo>
      <div className="mt-6">
        <ErrorMessage message={error.message || 'Erro inesperado.'} />
      </div>
      <Button v="outline" className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
