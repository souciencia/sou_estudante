import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MOBILE_MEDIA_QUERY, useMediaQuery } from './use-media-query'

function stubMatchMedia(matches: boolean) {
  let listener: (() => void) | undefined

  const mediaQueryList = {
    matches,
    addEventListener: (_: string, cb: () => void) => {
      listener = cb
    },
    removeEventListener: () => {
      listener = undefined
    },
  }

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQueryList),
  )

  return {
    setMatches(next: boolean) {
      mediaQueryList.matches = next
      listener?.()
    },
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when matchMedia is unavailable (servidor/jsdom)', () => {
    const { result } = renderHook(() => useMediaQuery(MOBILE_MEDIA_QUERY))
    expect(result.current).toBe(false)
  })

  it('reflects the media query result when matchMedia is available', () => {
    stubMatchMedia(true)

    const { result } = renderHook(() => useMediaQuery(MOBILE_MEDIA_QUERY))

    expect(result.current).toBe(true)
  })

  it('updates when the media query changes', () => {
    const { setMatches } = stubMatchMedia(false)

    const { result } = renderHook(() => useMediaQuery(MOBILE_MEDIA_QUERY))
    expect(result.current).toBe(false)

    act(() => setMatches(true))
    expect(result.current).toBe(true)
  })
})
