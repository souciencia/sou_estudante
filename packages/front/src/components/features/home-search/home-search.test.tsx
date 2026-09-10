import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { buildCursosSearchHref, HomeSearch } from './home-search'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('buildCursosSearchHref', () => {
  it('monta a URL de /cursos com o termo codificado', () => {
    expect(buildCursosSearchHref('engenharia de software')).toBe(
      '/cursos?q=engenharia+de+software',
    )
  })

  it('ignora espaços nas extremidades do termo', () => {
    expect(buildCursosSearchHref('  medicina  ')).toBe('/cursos?q=medicina')
  })
})

describe('HomeSearch', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>)
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('redireciona para /cursos com o termo buscado ao pressionar Enter', () => {
    render(<HomeSearch />)
    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockPush).toHaveBeenCalledWith('/cursos?q=medicina')
  })

  it('propaga o módulo para o autocomplete', () => {
    render(<HomeSearch module="2" />)

    expect(
      screen.getByRole('combobox').closest('[data-module]'),
    ).toHaveAttribute('data-module', '2')
  })
})
