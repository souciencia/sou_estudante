import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { CourseSearchEntry } from './course-search-entry'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('CourseSearchEntry', () => {
  beforeEach(() => {
    push.mockClear()
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('redireciona para a busca de cursos com o termo ao submeter', () => {
    render(<CourseSearchEntry />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(push).toHaveBeenCalledWith('/cursos?q=medicina')
  })
})
