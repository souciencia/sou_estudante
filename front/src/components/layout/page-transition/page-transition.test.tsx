import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageTransition } from './page-transition'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('PageTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePathname).mockReturnValue('/cursos')
  })

  it('rende os children', () => {
    render(
      <PageTransition>
        <p>conteúdo da página</p>
      </PageTransition>,
    )

    expect(screen.getByText('conteúdo da página')).toBeInTheDocument()
  })

  it('aplica a classe de transição e o className extra', () => {
    const { container } = render(
      <PageTransition className="space-y-4">
        <p>conteúdo</p>
      </PageTransition>,
    )

    const wrapper = container.firstElementChild

    expect(wrapper).toHaveClass('page-transition', 'space-y-4')
  })

  it('remonta o wrapper ao trocar de rota, reiniciando a animação', () => {
    const { container, rerender } = render(
      <PageTransition>
        <p>conteúdo</p>
      </PageTransition>,
    )

    const before = container.firstElementChild

    vi.mocked(usePathname).mockReturnValue('/cursos/123')
    rerender(
      <PageTransition>
        <p>conteúdo</p>
      </PageTransition>,
    )

    const after = container.firstElementChild

    expect(after).not.toBe(before)
    expect(container.querySelectorAll('.page-transition')).toHaveLength(1)
  })
})
