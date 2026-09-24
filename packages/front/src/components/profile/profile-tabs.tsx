'use client'

import { type ReactNode, useId, useState } from 'react'
import { cn } from '@/utils/cn'
import { ProfileTabsContext } from './profile-tabs-context'

export interface ProfileTabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function ProfileTabs({
  defaultValue,
  children,
  className,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)
  const idBase = useId()

  return (
    <ProfileTabsContext.Provider value={{ activeTab, setActiveTab, idBase }}>
      <div className={cn('flex flex-col gap-6', className)}>{children}</div>
    </ProfileTabsContext.Provider>
  )
}
