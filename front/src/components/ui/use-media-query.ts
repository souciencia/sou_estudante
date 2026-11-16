import { useCallback, useSyncExternalStore } from 'react'

/**
 * Fronteira do modo mobile. Deve ficar sincronizada com `--breakpoint-md`
 * (48rem = 768px) em `src/app/globals.css`: abaixo dela o layout de busca
 * empilha e o FilterPanel vira bottom sheet.
 */
export const MOBILE_MEDIA_QUERY = '(max-width: 47.999rem)'

function canUseMatchMedia(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  )
}

/**
 * Observa uma media query CSS (`window.matchMedia`) e devolve se ela casa.
 * SSR-safe: sem `window.matchMedia` (servidor/jsdom) devolve `false`, então o
 * primeiro render sempre assume desktop e evita hydration mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!canUseMatchMedia()) return () => {}
      const mediaQueryList = window.matchMedia(query)
      mediaQueryList.addEventListener('change', onStoreChange)
      return () => mediaQueryList.removeEventListener('change', onStoreChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => {
    if (!canUseMatchMedia()) return false
    return window.matchMedia(query).matches
  }, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
