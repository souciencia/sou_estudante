import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MaskEnade } from './mask-enade'

describe('MaskEnade', () => {
  it('é decorativo e renderiza o mar em svg', () => {
    const { container } = render(<MaskEnade level={4} />)

    const mask = container.querySelector('[data-mask="enade"]')
    expect(mask).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('usa a superfície da faixa do Enade', () => {
    const { container } = render(<MaskEnade level={1} />)

    expect(
      container.querySelector('[data-mask="enade"]')?.getAttribute('style'),
    ).toContain('--color-low-surface')
  })

  it('cai na neblina quando não há conceito (SC/null)', () => {
    const { container } = render(<MaskEnade level={null} />)

    expect(
      container.querySelector('[data-mask="enade"]')?.getAttribute('style'),
    ).toContain('--color-muted')
  })
})
