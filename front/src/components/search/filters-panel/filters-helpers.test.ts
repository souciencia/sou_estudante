import { describe, expect, it } from 'vitest'
import { buildFilterOptions } from './filters-helpers'

describe('buildFilterOptions', () => {
  it('retorna lista vazia quando não há buckets', () => {
    expect(buildFilterOptions(undefined)).toEqual([])
    expect(buildFilterOptions([])).toEqual([])
  })

  it('usa a chave como rótulo e ordena alfabeticamente', () => {
    const options = buildFilterOptions([
      { key: 'Uberlândia', count: 1 },
      { key: 'Anápolis', count: 2 },
    ])

    expect(options.map((option) => option.label)).toEqual([
      'Anápolis',
      'Uberlândia',
    ])
    expect(options[0].value).toBe('Anápolis')
  })

  it('aplica a função de rótulo quando informada', () => {
    const options = buildFilterOptions([{ key: 'SP', count: 323 }], (key) =>
      key === 'SP' ? 'São Paulo' : key,
    )

    expect(options).toEqual([{ label: 'São Paulo', value: 'SP' }])
  })
})
