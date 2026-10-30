import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  CompareProvider,
  useCompareCursos,
} from '@/components/compare/compare-provider'
import { Header } from './header'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

function renderHeader(ui: ReactElement) {
  return render(<CompareProvider>{ui}</CompareProvider>)
}

function Seed({ ids }: { ids: string[] }) {
  const { toggle } = useCompareCursos()
  return (
    <button
      type="button"
      onClick={() => {
        for (const id of ids) toggle(id)
      }}
    >
      seed
    </button>
  )
}

function renderHeaderWithIds(ids: string[]) {
  return render(
    <CompareProvider>
      <Seed ids={ids} />
      <Header variant="inner" module="1" />
    </CompareProvider>,
  )
}

describe('Header', () => {
  it('links the application logo to the home page', () => {
    renderHeader(<Header />)

    const homeLink = screen.getByRole('link', {
      name: /SoU_Estudante/,
    })

    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('renders the menu', () => {
    renderHeader(<Header />)

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  describe('inner variant', () => {
    it('links the site name to the home page', () => {
      renderHeader(<Header variant="inner" />)

      expect(
        screen.getByRole('link', { name: /SoU_Estudante/ }),
      ).toHaveAttribute('href', '/')
    })

    it('renders a comparison count linking to /comparar when courses are selected', () => {
      renderHeaderWithIds(['101', '102'])

      fireEvent.click(screen.getByRole('button', { name: 'seed' }))

      const pill = screen.getByRole('link', { name: 'Comparar (2)' })
      expect(pill).toHaveAttribute('href', '/comparar')
    })

    it('renders a clear button that resets the selection', () => {
      renderHeaderWithIds(['101', '102'])

      fireEvent.click(screen.getByRole('button', { name: 'seed' }))

      const nav = screen.getByRole('navigation', {
        name: 'Navegação principal',
      })
      fireEvent.click(
        within(nav).getByRole('button', { name: 'Limpar comparação' }),
      )

      expect(
        screen.queryByRole('link', { name: 'Comparar (2)' }),
      ).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Comparar' })).toBeInTheDocument()
    })
  })
})
