'use client'

import { createContext, useContext } from 'react'

interface SiteMenuContextValue {
  isOpen: boolean
  listId: string
  toggle: () => void
  close: () => void
}

export const SiteMenuContext = createContext<SiteMenuContextValue | null>(null)

export const useSiteMenu = () => {
  const context = useContext(SiteMenuContext)

  if (!context) {
    throw new Error('SiteMenu.* deve ser usado dentro de <SiteMenu>')
  }

  return context
}
