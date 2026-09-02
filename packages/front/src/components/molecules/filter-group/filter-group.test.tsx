// components/molecules/filter-group/filter-group.test.tsx

import { fireEvent, render, screen } from '@testing-library/react'
import { Component, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FilterGroup } from './index'

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <div role="alert">{this.state.error.message}</div>
    }
    return this.props.children
  }
}

describe('FilterGroup', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza título, opções e contagens', () => {
    render(
      <FilterGroup>
        <FilterGroup.Title>Categoria</FilterGroup.Title>
        <FilterGroup.List>
          <FilterGroup.Option label="Federal" resultCount={7} />
          <FilterGroup.Option label="Municipal" defaultChecked />
          <FilterGroup.Option label="Privada" disabled />
        </FilterGroup.List>
      </FilterGroup>,
    )

    expect(
      screen.getByRole('heading', { name: 'Categoria' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Federal' }),
    ).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Municipal' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Privada' })).toBeDisabled()
  })

  it('suporta modo controlado com checked e onChange', () => {
    const handleChange = vi.fn()
    render(
      <FilterGroup>
        <FilterGroup.Title>Turno</FilterGroup.Title>
        <FilterGroup.List>
          <FilterGroup.Option
            label="Noturno"
            value="Noturno"
            checked={false}
            onChange={handleChange}
          />
        </FilterGroup.List>
      </FilterGroup>,
    )

    const checkbox = screen.getByRole('checkbox', { name: 'Noturno' })
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalled()
  })

  it('lança erro quando um sub-componente é usado fora de Root', () => {
    render(
      <ErrorBoundary>
        <FilterGroup.Option label="Federal" />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert').textContent).toContain(
      'must be rendered inside <FilterGroup.Root>',
    )
  })
})
