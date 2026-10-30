'use client'

import type { ReactNode } from 'react'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import { ProfileContext } from './profile-context'
import { ProfileRoutes } from './profile-routes'

export interface ProfileRootProps {
  children: ReactNode
  module?: Module
  /** Id do curso exibido: aponta as rotas para os perfis do mesmo curso. */
  courseId?: number
  /** Id da IES do curso exibido: aponta "Instituição" para o perfil da IES. */
  iesId?: string
  className?: string
}

export function ProfileRoot({
  children,
  module,
  courseId,
  iesId,
  className,
}: ProfileRootProps) {
  return (
    <ProfileContext.Provider value={{ module }}>
      <div
        data-module={module}
        className={cn(
          'mx-auto min-h-screen max-w-2xl bg-surface-lv1 pb-10 rounded-b-card shadw',
          className,
        )}
      >
        <ProfileRoutes module={module} courseId={courseId} iesId={iesId} />
        {children}
      </div>
    </ProfileContext.Provider>
  )
}
