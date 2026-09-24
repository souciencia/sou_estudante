'use client'

import type { ReactNode } from 'react'
import { useProfileTabsContext } from './profile-tabs-context'

export interface ProfileTabPanelProps {
  value: string
  children: ReactNode
  className?: string
}

export function ProfileTabPanel({
  value,
  children,
  className,
}: ProfileTabPanelProps) {
  const { activeTab, idBase } = useProfileTabsContext('Profile.TabPanel')

  if (activeTab !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`${idBase}-panel-${value}`}
      aria-labelledby={`${idBase}-tab-${value}`}
      className={className}
    >
      {children}
    </div>
  )
}
