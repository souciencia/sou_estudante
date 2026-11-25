import { TooltipContent } from './tooltip-content'
import { TooltipIcon } from './tooltip-icon'
import { TooltipRoot } from './tooltip-root'

export type { TooltipContentProps } from './tooltip-content'
export type { TooltipIconProps } from './tooltip-icon'
export type { TooltipRootProps } from './tooltip-root'

export const Tooltip = Object.assign(TooltipRoot, {
  Icon: TooltipIcon,
  Content: TooltipContent,
})
