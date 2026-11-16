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
})
