import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { CourseSearchRedirect } from './course-search-redirect'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

describe('CourseSearchRedirect', () => {
  beforeEach(() => {
    push.mockClear()
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('renders the title and description', () => {
    render(
      <CourseSearchRedirect
        to="ingresso"
        title="Onde você quer estudar?"
        description="Texto de apoio"
      />,
    )

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Onde você quer estudar?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Texto de apoio')).toBeInTheDocument()
  })

  it('redirects to the course search preserving the origin on submit', () => {
    render(
      <CourseSearchRedirect to="ingresso" title="Onde você quer estudar?" />,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(push).toHaveBeenCalledWith(
      '/cursos?q=medicina&to=ingresso&ingresso=sisu',
    )
  })

  it('does not add the sisu filter for the permanencia origin', () => {
    render(<CourseSearchRedirect to="permanencia" title="Como permanecer?" />)

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(push).toHaveBeenCalledWith('/cursos?q=medicina&to=permanencia')
  })
})
