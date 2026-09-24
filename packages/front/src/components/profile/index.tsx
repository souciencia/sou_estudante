import { ProfileHeader } from './profile-header'
import { ProfileLocation } from './profile-location'
import { ProfileOverview } from './profile-overview'
import { ProfileRoot } from './profile-root'
import { ProfileSection } from './profile-section'
import { ProfileTab } from './profile-tab'
import { ProfileTabList } from './profile-tab-list'
import { ProfileTabPanel } from './profile-tab-panel'
import { ProfileTabs } from './profile-tabs'
import { ProfileTopBar } from './profile-top-bar'

export const Profile = Object.assign(ProfileRoot, {
  TopBar: ProfileTopBar,
  Header: ProfileHeader,
  Location: ProfileLocation,
  Tabs: ProfileTabs,
  TabList: ProfileTabList,
  Tab: ProfileTab,
  TabPanel: ProfileTabPanel,
  Overview: ProfileOverview,
  Section: ProfileSection,
})

export type { ProfileHeaderProps } from './profile-header'
export type { ProfileLocationProps } from './profile-location'
export type { OverviewItem, ProfileOverviewProps } from './profile-overview'
export type { ProfileRootProps } from './profile-root'
export type { ProfileSectionProps } from './profile-section'
export type { ProfileTabProps } from './profile-tab'
export type { ProfileTabListProps } from './profile-tab-list'
export type { ProfileTabPanelProps } from './profile-tab-panel'
export type { ProfileTabsProps } from './profile-tabs'
export type { ProfileTopBarProps } from './profile-top-bar'
