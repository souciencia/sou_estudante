import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { IconTile } from './icon-tile'

describe('IconTile', () => {
  it('exposes the module theme through data-module', () => {
    const { container } = render(
      <IconTile module="2">
        <svg data-testid="icon" />
      </IconTile>,
    )
    expect(container.querySelector('[data-module="2"]')).toBeInTheDocument()
  })

  it('renders its children', () => {
    const { getByTestId } = render(
      <IconTile module="1">
        <svg data-testid="icon" />
      </IconTile>,
    )
    expect(getByTestId('icon')).toBeInTheDocument()
  })

  it('keeps a forwarded className', () => {
    const { container } = render(
      <IconTile module="1" className="custom-class">
        <span />
      </IconTile>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
