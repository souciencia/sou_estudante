'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { useProfileTabsContext } from './profile-tabs-context'

export interface ProfileTabProps {
  value: string
  children: ReactNode
  className?: string
}

export function ProfileTab({ value, children, className }: ProfileTabProps) {
  const { activeTab, setActiveTab, idBase } =
    useProfileTabsContext('Profile.Tab')
  const selected = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      id={`${idBase}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${idBase}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      data-tab-value={value}
      onClick={() => setActiveTab(value)}
      className={cn(
        'flex-1 rounded-[18px] px-4 py-3 font-coadjuvant text-coadjuvant font-bold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        selected
          ? 'bg-card-surface text-accent-deep shadow-sm'
          : 'bg-transparent text-fg-muted hover:text-fg-coadjuvant',
        className,
      )}
    >
      {children}
    </button>
  )
}
