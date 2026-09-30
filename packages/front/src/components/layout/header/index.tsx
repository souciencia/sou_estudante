'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/header/header'

export const ShellHeader = () => {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return <Header className={isHome ? 'max-w-home' : 'max-w-pages'} />
}
