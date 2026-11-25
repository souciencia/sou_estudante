import { TooltipIcon } from './tooltip-icon'
import { TooltipRoot } from './tooltip-root'
import { TooltipContent } from './tooltip-content'


export const Tooltip = Object.assign(TooltipRoot, {
  Icon: TooltipIcon,
  Content: TooltipContent
})
