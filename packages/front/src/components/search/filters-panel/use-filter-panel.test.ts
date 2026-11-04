import { act, renderHook } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFilterPanel } from './use-filter-panel'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

describe('useFilterPanel', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setParams = (search: string) => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(search) as unknown as ReadonlyURLSearchParams,
    )
  }

  it('lê os valores ativos de uma chave, separados por vírgula', () => {
    setParams('uf=SP,RJ')

    const { result } = renderHook(() => useFilterPanel(updateParams))

    expect(result.current.getActiveValues('uf')).toEqual(['SP', 'RJ'])
    expect(result.current.getActiveValues('turno')).toEqual([])
  })

  it('acumula um novo valor mantendo os existentes e volta à página 1', () => {
    setParams('uf=SP')

    const { result } = renderHook(() => useFilterPanel(updateParams))

    act(() => {
      result.current.toggle('uf', 'RJ')
    })

    expect(updateParams).toHaveBeenCalledWith({ uf: 'SP,RJ', page: '1' })
  })

  it('remove o valor quando já está ativo e limpa a chave se ficar vazia', () => {
    setParams('uf=SP')

    const { result } = renderHook(() => useFilterPanel(updateParams))

    act(() => {
      result.current.toggle('uf', 'SP')
    })

    expect(updateParams).toHaveBeenCalledWith({ uf: null, page: '1' })
  })

  it('grava o estado completo dos filtros de uma vez e volta à página 1', () => {
    setParams('uf=SP')

    const { result } = renderHook(() => useFilterPanel(updateParams))

    act(() => {
      result.current.apply({
        uf: ['SP', 'RJ'],
        turno: [],
        grau: ['Bacharelado'],
      })
    })

    expect(updateParams).toHaveBeenCalledWith({
      uf: 'SP,RJ',
      turno: null,
      grau: 'Bacharelado',
      page: '1',
    })
  })
})
