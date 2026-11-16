import { act, renderHook } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMunicipioFilterPanel } from './use-municipio-filter-panel'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

const municipios = {
  SP: [
    { codigo: '3550308', nome: 'São Paulo' },
    { codigo: '3509502', nome: 'Campinas' },
  ],
  RJ: [{ codigo: '3304557', nome: 'Rio de Janeiro' }],
}

describe('useMunicipioFilterPanel', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setParams = (search: string) => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams(search) as unknown as ReadonlyURLSearchParams,
    )
  }

  it('ao desmarcar um estado, remove os municípios daquele estado', () => {
    setParams('uf=SP,RJ&municipio=3550308,3304557')

    const { result } = renderHook(() =>
      useMunicipioFilterPanel(updateParams, municipios),
    )

    act(() => {
      result.current.onToggle('uf', 'SP')
    })

    expect(updateParams).toHaveBeenCalledWith({
      uf: 'RJ',
      municipio: '3304557',
      page: '1',
    })
  })

  it('ao marcar um estado, mantém os municípios já selecionados', () => {
    setParams('uf=RJ&municipio=3304557')

    const { result } = renderHook(() =>
      useMunicipioFilterPanel(updateParams, municipios),
    )

    act(() => {
      result.current.onToggle('uf', 'SP')
    })

    expect(updateParams).toHaveBeenCalledWith({
      uf: 'RJ,SP',
      municipio: '3304557',
      page: '1',
    })
  })

  it('roteia outras chaves para o toggle padrão', () => {
    setParams('')

    const { result } = renderHook(() =>
      useMunicipioFilterPanel(updateParams, municipios),
    )

    act(() => {
      result.current.onToggle('municipio', '3550308')
    })

    expect(updateParams).toHaveBeenCalledWith({
      municipio: '3550308',
      page: '1',
    })
  })

  it('onApply remove municípios de estados não selecionados', () => {
    setParams('')

    const { result } = renderHook(() =>
      useMunicipioFilterPanel(updateParams, municipios),
    )

    act(() => {
      result.current.onApply({ uf: ['RJ'], municipio: ['3550308', '3304557'] })
    })

    expect(updateParams).toHaveBeenCalledWith({
      uf: 'RJ',
      municipio: '3304557',
      page: '1',
    })
  })
})
