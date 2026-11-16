'use client'

import { usePathname } from 'next/navigation'
import { moduleFromPathname } from '@/lib/module'
import { PAGE_CONTAINER_CLASS, pageContainer } from '@/lib/page-container'
import { Header } from './header'

export const ShellHeader = () => {
  const pathname = usePathname()
  const container = pageContainer(pathname)

  if (container === 'home') {
    return <Header variant="home" className={PAGE_CONTAINER_CLASS.home} />
  }

  if (container === 'pages') {
    return (
      <Header
        variant="inner"
        module={moduleFromPathname(pathname)}
        className={PAGE_CONTAINER_CLASS.pages}
      />
    )
  }

  return (
    <Header
      variant="profile"
      module={moduleFromPathname(pathname)}
      className={PAGE_CONTAINER_CLASS[container]}
    />
  )
}
