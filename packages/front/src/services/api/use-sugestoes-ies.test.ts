// src/services/api/use-sugestoes-ies.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { iesService } from './ies.service'
import { useSugestoesIes } from './use-sugestoes-ies'

vi.mock('./ies.service', () => ({
  iesService: { sugerirIes: vi.fn() },
}))

describe('useSugestoesIes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca sugestões de IES para o termo informado', async () => {
    vi.mocked(iesService.sugerirIes).mockResolvedValue([
      'UNIVERSIDADE DE SÃO PAULO',
    ])

    const { result } = renderHook(() => useSugestoesIes('universidade'))

    await waitFor(() => {
      expect(iesService.sugerirIes).toHaveBeenCalledWith('universidade')
      expect(result.current.sugestoes).toEqual(['UNIVERSIDADE DE SÃO PAULO'])
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('não busca sugestões para termo abaixo do mínimo', () => {
    const { result } = renderHook(() => useSugestoesIes('a'))

    expect(result.current.sugestoes).toEqual([])
    expect(iesService.sugerirIes).not.toHaveBeenCalled()
  })
})
