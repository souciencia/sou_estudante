'use client'

import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { ProfileContext } from './profile-context'

export interface ProfileRootProps {
  children: ReactNode
  module?: Module
  className?: string
}

export function ProfileRoot({ children, module, className }: ProfileRootProps) {
  return (
    <ProfileContext.Provider value={{ module }}>
      <main
        data-module={module}
        className={cn(
          'mx-auto min-h-screen max-w-2xl bg-site-background pb-10',
          className,
        )}
      >
        {children}
      </main>
    </ProfileContext.Provider>
  )
}
