import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('keeps a font size together with a text color', () => {
    expect(cn('text-xs', 'text-fg-muted')).toBe('text-xs text-fg-muted')
  })

  it('keeps a font size together with an accent text color', () => {
    expect(cn('text-xs', 'text-accent-deep')).toBe('text-xs text-accent-deep')
  })

  it('keeps on-dark as a color next to a font size', () => {
    expect(cn('text-sm', 'text-on-dark')).toBe('text-sm text-on-dark')
  })

  it('treats text-display as a font size, not a color', () => {
    expect(cn('text-display', 'text-fg')).toBe('text-display text-fg')
    expect(cn('text-sm', 'text-display')).toBe('text-display')
  })

  it('treats text-2xs as a font size, not a color', () => {
    expect(cn('text-2xs', 'text-fg-muted')).toBe('text-2xs text-fg-muted')
    expect(cn('text-xs', 'text-2xs')).toBe('text-2xs')
  })

  it('keeps font-size and font-family independent', () => {
    expect(cn('text-xl', 'font-display')).toBe('text-xl font-display')
  })

  it('lets the last font-family win', () => {
    expect(cn('font-sans', 'font-display')).toBe('font-display')
  })

  it('lets the last text color win', () => {
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted')
  })

  it('lets a custom radius token be overridden by className', () => {
    expect(cn('rounded-panel', 'rounded-full')).toBe('rounded-full')
    expect(cn('rounded-full', 'rounded-card')).toBe('rounded-card')
  })
})
