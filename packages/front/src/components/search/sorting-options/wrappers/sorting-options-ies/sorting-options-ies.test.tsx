import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchIes } from '@/services/api/use-search-ies'
import { SortingOptionsIes } from './sorting-options-ies'

vi.mock('@/services/api/use-search-ies', () => ({
  useSearchIes: vi.fn(),
}))

describe('SortingOptionsIes', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchIes).mockReturnValue({
      updateParams,
    } as unknown as ReturnType<typeof useSearchIes>)
  })

  it('atualiza o parâmetro sort ao pressionar uma opção', () => {
    render(<SortingOptionsIes />)

    fireEvent.click(screen.getByRole('button', { name: 'Relevância' }))

    expect(updateParams).toHaveBeenCalledWith({ sort: 'relevancia' })
  })

  it('propaga o módulo para os botões', () => {
    render(<SortingOptionsIes module="4" />)

    expect(screen.getByRole('button', { name: 'A Z' })).toHaveAttribute(
      'data-module',
      '4',
    )
  })
})
