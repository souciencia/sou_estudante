import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IES } from '@/services/api/types'
import { useIes } from '@/services/api/use-ies'
import { ProfileIESLoader } from './profile-ies-loader'

vi.mock('@/services/api/use-ies', () => ({
  useIes: vi.fn(),
}))

vi.mock('./profile-ies', () => ({
  ProfileIES: () => <div>perfil da ies</div>,
}))

describe('ProfileIESLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza o perfil quando há dados', () => {
    vi.mocked(useIes).mockReturnValue({
      ies: { co_ies: '376' } as IES,
      isLoading: false,
      error: null,
      notFound: false,
    })

    render(<ProfileIESLoader id="376" />)

    expect(screen.getByText('perfil da ies')).toBeInTheDocument()
  })

  it('mostra o estado "não encontrado" com link de volta à busca', () => {
    vi.mocked(useIes).mockReturnValue({
      ies: null,
      isLoading: false,
      error: null,
      notFound: true,
    })

    render(<ProfileIESLoader id="999" />)

    expect(screen.getByText('Instituição não encontrada')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar à busca' }),
    ).toHaveAttribute('href', '/ies')
  })
})
