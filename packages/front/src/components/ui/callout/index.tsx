import { CalloutContent } from './callout-content'
import { CalloutFooter } from './callout-footer'
import { CalloutHeader } from './callout-header'
import { CalloutHeaderContent } from './callout-header-content'
import { CalloutIcon } from './callout-icon'
import { CalloutRoot } from './callout-root'
import { CalloutTagline } from './callout-tagline'
import { CalloutTitle } from './callout-title'

export type { CalloutVariant } from './callout-root'

export const Callout = Object.assign(CalloutRoot, {
  Header: CalloutHeader,
  HeaderContent: CalloutHeaderContent,
  Icon: CalloutIcon,
  Tagline: CalloutTagline,
  Title: CalloutTitle,
  Content: CalloutContent,
  Footer: CalloutFooter,
})
