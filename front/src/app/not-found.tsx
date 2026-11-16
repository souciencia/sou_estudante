import Link from 'next/link'
import { Typo } from '@/components/ui/typo'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center">
      <Typo v="title" s="xl" t="h1" className="block">
        Página não encontrada
      </Typo>
      <Typo v="mute" s="sm" t="p" className="mt-2">
        O endereço acessado não existe ou foi movido.
      </Typo>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full border border-accent px-5 py-2 font-sans text-sm font-bold text-accent-deep transition-colors hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
