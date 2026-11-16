import { fireEvent, render, screen } from '@testing-library/react'
import type { ReadonlyURLSearchParams } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { SortingOptionsIes } from './sorting-options-ies'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

describe('SortingOptionsIes', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as unknown as ReadonlyURLSearchParams,
    )
    vi.mocked(useSearchIes).mockReturnValue({
      updateParams,
    } as unknown as ReturnType<typeof useSearchIes>)
  })

  it('atualiza o parâmetro sort ao pressionar uma opção', () => {
    render(<SortingOptionsIes />)

    fireEvent.click(screen.getByRole('radio', { name: 'Relevância' }))

    expect(updateParams).toHaveBeenCalledWith({ sort: 'relevancia' })
  })

  it('renderiza o grupo de ordenação com título', () => {
    render(<SortingOptionsIes />)

    expect(
      screen.getByRole('region', { name: 'Ordenação' }),
    ).toBeInTheDocument()
  })

  it('propaga o módulo para o grupo', () => {
    render(<SortingOptionsIes module="4" />)

    expect(screen.getByRole('region', { name: 'Ordenação' })).toHaveAttribute(
      'data-module',
      '4',
    )
  })
})
