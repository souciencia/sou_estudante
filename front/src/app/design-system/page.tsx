import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Design System',
  robots: { index: false, follow: false },
}

const DesignSystem = dynamic(() => import('./design-system'))

/**
 * Página interna de design system: oculta dos menus (sem links) e não indexada
 * (`robots: noindex, nofollow`), mas acessível em produção pela URL direta
 * `/design-system`. O conteúdo é carregado em lazy loading (`dynamic`), fora
 * do bundle principal.
 */
export default function Page() {
  return <DesignSystem />
}
