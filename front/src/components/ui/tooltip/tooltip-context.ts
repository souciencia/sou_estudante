import { createContext, type RefObject, useContext } from 'react'

export type TooltipSize = 'sm' | 'md'

export interface TooltipContextValue {
  open: boolean
  size: TooltipSize
  contentId: string
  triggerRef: RefObject<HTMLButtonElement | null>
  closeRef: RefObject<HTMLButtonElement | null>
  openTooltip: () => void
  closeTooltip: () => void
  toggleTooltip: () => void
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

/**
 * Reads the Tooltip context, failing loudly when a subcomponent is rendered
 * outside of `<Tooltip>`. Keeps dependencies explicit and traceable.
 */
export function useTooltipContext(subComponent: string): TooltipContextValue {
  const context = useContext(TooltipContext)
  if (context === null) {
    throw new Error(`${subComponent} must be rendered inside <Tooltip>.`)
  }
  return context
}
