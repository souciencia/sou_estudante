import { createContext, useContext } from 'react'

export interface ProfileTabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
  idBase: string
}

export const ProfileTabsContext = createContext<ProfileTabsContextValue | null>(
  null,
)

/**
 * Reads the Profile.Tabs context, failing loudly when a subcomponent is
 * rendered outside of `<Profile.Tabs>`.
 */
export function useProfileTabsContext(
  subComponent: string,
): ProfileTabsContextValue {
  const context = useContext(ProfileTabsContext)
  if (context === null) {
    throw new Error(`${subComponent} must be rendered inside <Profile.Tabs>.`)
  }
  return context
}
