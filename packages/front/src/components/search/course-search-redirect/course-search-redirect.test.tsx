import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CompareProvider,
  useCompareCursos,
} from '@/components/compare/compare-provider'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { CourseSearchRedirect } from './course-search-redirect'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/services/api/use-sugestoes-cursos', () => ({
  useSugestoesCursos: vi.fn(),
}))

function ComparingProbe() {
  const { isComparing } = useCompareCursos()
  return <span data-testid="comparing">{String(isComparing)}</span>
}

function renderRedirect(node: ReactNode) {
  return render(
    <CompareProvider>
      <ComparingProbe />
      {node}
    </CompareProvider>,
  )
}

describe('CourseSearchRedirect', () => {
  beforeEach(() => {
    push.mockClear()
    vi.mocked(useSugestoesCursos).mockReturnValue({
      sugestoes: [],
      isLoading: false,
    })
  })

  it('renders the title and description', () => {
    renderRedirect(
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
    renderRedirect(
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
    renderRedirect(
      <CourseSearchRedirect to="permanencia" title="Como permanecer?" />,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(push).toHaveBeenCalledWith('/cursos?q=medicina&to=permanencia')
  })

  it('activates the compare mode without a to param for the comparar origin', () => {
    renderRedirect(
      <CourseSearchRedirect to="comparar" title="Quais cursos comparar?" />,
    )

    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'medicina' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(push).toHaveBeenCalledWith('/cursos?q=medicina')
    expect(screen.getByTestId('comparing')).toHaveTextContent('true')
  })
})
