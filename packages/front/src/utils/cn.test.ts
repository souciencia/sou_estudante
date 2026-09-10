import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('keeps a custom font-size together with a text color', () => {
    const result = cn('text-coadjuvant-sm', 'text-fg-muted')
    expect(result).toContain('text-coadjuvant-sm')
    expect(result).toContain('text-fg-muted')
  })

  it('keeps a custom font-size together with an accent text color', () => {
    const result = cn('text-coadjuvant-xs', 'text-accent-deep')
    expect(result).toContain('text-coadjuvant-xs')
    expect(result).toContain('text-accent-deep')
  })

  it('keeps font-size and font-family independent', () => {
    const result = cn('text-protagonist-lg', 'font-title-protagonist')
    expect(result).toContain('text-protagonist-lg')
    expect(result).toContain('font-title-protagonist')
  })

  it('lets the last font-family win', () => {
    expect(cn('font-title-protagonist', 'font-title-coadjuvant')).toBe(
      'font-title-coadjuvant',
    )
  })

  it('lets the last text color win', () => {
    expect(cn('text-fg-protagonist', 'text-fg-coadjuvant')).toBe(
      'text-fg-coadjuvant',
    )
  })
})
