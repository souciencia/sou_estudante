'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header/header'

const HOME_MAX_WIDTH = 'mx-auto w-full min-[860px]:max-w-[900px]'

/**
 * Coloca o `Header` dentro da largura de conteúdo da home apenas nessa rota.
 * Nas demais, o header ocupa a largura total.
 */
export const ShellHeader = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return <Header className={isHome ? HOME_MAX_WIDTH : undefined} />
}
