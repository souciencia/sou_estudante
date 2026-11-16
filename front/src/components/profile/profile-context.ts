import { createContext, useContext } from 'react'
import type { Module } from '@/lib/module'

export interface ProfileContextValue {
  module?: Module
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)

/**
 * Reads the Profile context, failing loudly when a subcomponent is rendered
 * outside of `<Profile>`. Keeps dependencies explicit and traceable.
 */
export function useProfileContext(subComponent: string): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (context === null) {
    throw new Error(`${subComponent} must be rendered inside <Profile>.`)
  }
  return context
}
