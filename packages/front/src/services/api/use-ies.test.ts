import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { iesService } from './ies.service'
import type { IES } from './types'
import { useIes } from './use-ies'

vi.mock('./ies.service', () => ({
  iesService: { getIes: vi.fn() },
}))

const makeIes = (): IES => ({
  co_ies: '376',
  no_ies: 'CENTRO UNIVERSITÁRIO ANHANGUERA',
  uf: 'SP',
})

describe('useIes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the IES when found', async () => {
    vi.mocked(iesService.getIes).mockResolvedValue({
      success: true,
      data: makeIes(),
    })

    const { result } = renderHook(() => useIes('376'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.ies?.co_ies).toBe('376')
    expect(result.current.notFound).toBe(false)
  })

  it('flags notFound when the API returns 404', async () => {
    vi.mocked(iesService.getIes).mockResolvedValue({
      success: false,
      error: { type: 'client', message: 'Not Found', statusCode: 404 },
    })

    const { result } = renderHook(() => useIes('999'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notFound).toBe(true)
    expect(result.current.ies).toBeNull()
  })

  it('surfaces an error when the request fails', async () => {
    vi.mocked(iesService.getIes).mockResolvedValue({
      success: false,
      error: { type: 'network', message: 'offline' },
    })

    const { result } = renderHook(() => useIes('376'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.notFound).toBe(false)
  })
})
