import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import IconModule from './iconModule'

const modules = ['1', '2', '3', '4', '5'] as const

describe('IconModule', () => {
  it.each(modules)('renders the icon for module %s', (module) => {
    const { container } = render(<IconModule module={module} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
