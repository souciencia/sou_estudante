import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearchCursos } from '@/services/api/use-search-cursos'
import { SearchSortignOptions } from './search-sorting-options'

vi.mock('@/services/api/use-search-cursos', () => ({
  useSearchCursos: vi.fn(),
}))

describe('SearchSortignOptions', () => {
  const updateParams = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchCursos).mockReturnValue({
      updateParams,
    } as unknown as ReturnType<typeof useSearchCursos>)
  })

  it('atualiza o parâmetro sort ao pressionar uma opção', () => {
    render(<SearchSortignOptions />)

    fireEvent.click(screen.getByRole('button', { name: 'A Z' }))

    expect(updateParams).toHaveBeenCalledWith({ sort: 'az' })
  })

  it('propaga o módulo para os botões', () => {
    render(<SearchSortignOptions module="2" />)

    expect(screen.getByRole('button', { name: 'Maior Enade' })).toHaveAttribute(
      'data-module',
      '2',
    )
  })
})
