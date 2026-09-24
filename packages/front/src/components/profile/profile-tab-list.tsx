'use client'

import { type KeyboardEvent, type ReactNode, useRef } from 'react'
import { cn } from '@/utils/cn'
import { useProfileTabsContext } from './profile-tabs-context'

export interface ProfileTabListProps {
  children: ReactNode
  className?: string
}

const NAVIGATION_KEYS = ['ArrowRight', 'ArrowLeft', 'Home', 'End']

export function ProfileTabList({ children, className }: ProfileTabListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const { setActiveTab } = useProfileTabsContext('Profile.TabList')

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!NAVIGATION_KEYS.includes(event.key)) {
      return
    }

    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ??
        [],
    )
    if (tabs.length === 0) {
      return
    }

    event.preventDefault()
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    const base = currentIndex < 0 ? 0 : currentIndex

    let nextIndex = base
    if (event.key === 'ArrowRight') nextIndex = (base + 1) % tabs.length
    if (event.key === 'ArrowLeft')
      nextIndex = (base - 1 + tabs.length) % tabs.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = tabs.length - 1

    const nextTab = tabs[nextIndex]
    const value = nextTab.dataset.tabValue
    if (value) {
      setActiveTab(value)
    }
    nextTab.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        'flex w-full gap-1 rounded-[22px] border border-card-border bg-muted/60 p-1',
        className,
      )}
    >
      {children}
    </div>
  )
}
