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
      <div
        data-module={module}
        className={cn('flex w-full flex-col bg-card-surface', className)}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {children}
        </div>
      </div>
    </ProfileContext.Provider>
  )
}
