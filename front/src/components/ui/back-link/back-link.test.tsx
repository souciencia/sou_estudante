import { fireEvent, render, screen } from '@testing-library/react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BackLink } from './back-link'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

const mockRouter = (overrides: Partial<AppRouterInstance> = {}) => {
  const router = {
    back: vi.fn(),
    push: vi.fn(),
    ...overrides,
  } as unknown as AppRouterInstance
  vi.mocked(useRouter).mockReturnValue(router)
  return router
}

describe('BackLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the label as a button', () => {
    mockRouter()
    render(<BackLink label="Resultados" />)
    expect(
      screen.getByRole('button', { name: 'Resultados' }),
    ).toBeInTheDocument()
  })

  it('falls back to the given href when there is no history', () => {
    const router = mockRouter()
    render(<BackLink label="Resultados" fallbackHref="/cursos" />)

    fireEvent.click(screen.getByRole('button', { name: 'Resultados' }))

    expect(router.push).toHaveBeenCalledWith('/cursos')
  })
})
