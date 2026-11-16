import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Curso } from '@/services/api/types'
import { useCurso } from '@/services/api/use-curso'
import { ProfileCursosLoader } from './profile-cursos-loader'

vi.mock('@/services/api/use-curso', () => ({
  useCurso: vi.fn(),
}))

vi.mock('./profile-cursos', () => ({
  ProfileCursos: () => <div>perfil do curso</div>,
}))

describe('ProfileCursosLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o perfil quando há dados', () => {
    vi.mocked(useCurso).mockReturnValue({
      curso: { sequencial: 1 } as unknown as Curso,
      isLoading: false,
      error: null,
      notFound: false,
    })

    render(<ProfileCursosLoader id="1" />)

    expect(screen.getByText('perfil do curso')).toBeInTheDocument()
  })

  it('mostra o estado "não encontrado" com link de volta à busca', () => {
    vi.mocked(useCurso).mockReturnValue({
      curso: null,
      isLoading: false,
      error: null,
      notFound: true,
    })

    render(<ProfileCursosLoader id="999" />)

    expect(screen.getByText('Curso não encontrado')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar à busca' }),
    ).toHaveAttribute('href', '/cursos')
  })

  it('mostra a mensagem de erro quando a busca falha', () => {
    vi.mocked(useCurso).mockReturnValue({
      curso: null,
      isLoading: false,
      error: 'Não foi possível carregar o curso. Tente novamente.',
      notFound: false,
    })

    render(<ProfileCursosLoader id="1" />)

    expect(
      screen.getByText('Não foi possível carregar o curso. Tente novamente.'),
    ).toBeInTheDocument()
  })
})
