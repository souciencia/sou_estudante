import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  CompareProvider,
  MAX_COMPARE,
  useCompareCursos,
} from './compare-provider'

const wrapper = ({ children }: { children: ReactNode }) => (
  <CompareProvider>{children}</CompareProvider>
)

describe('useCompareCursos', () => {
  it('adiciona e remove um curso da seleção', () => {
    const { result } = renderHook(() => useCompareCursos(), { wrapper })

    act(() => result.current.toggle('101'))
    expect(result.current.ids).toEqual(['101'])
    expect(result.current.isSelected('101')).toBe(true)

    act(() => result.current.toggle('101'))
    expect(result.current.ids).toEqual([])
    expect(result.current.isSelected('101')).toBe(false)
  })

  it('preserva a ordem de seleção', () => {
    const { result } = renderHook(() => useCompareCursos(), { wrapper })

    act(() => {
      result.current.toggle('30')
      result.current.toggle('10')
      result.current.toggle('20')
    })

    expect(result.current.ids).toEqual(['30', '10', '20'])
  })

  it(`limita a seleção a ${MAX_COMPARE} cursos`, () => {
    const { result } = renderHook(() => useCompareCursos(), { wrapper })

    act(() => {
      for (let index = 1; index <= MAX_COMPARE + 2; index += 1) {
        result.current.toggle(String(index))
      }
    })

    expect(result.current.ids).toHaveLength(MAX_COMPARE)
    expect(result.current.ids).toEqual(['1', '2', '3', '4', '5'])
  })

  it('ativa e desativa o modo de comparação', () => {
    const { result } = renderHook(() => useCompareCursos(), { wrapper })

    act(() => result.current.setComparing(true))
    expect(result.current.isComparing).toBe(true)

    act(() => result.current.setComparing(false))
    expect(result.current.isComparing).toBe(false)
  })

  it('limpa a seleção', () => {
    const { result } = renderHook(() => useCompareCursos(), { wrapper })

    act(() => {
      result.current.toggle('101')
      result.current.clear()
    })

    expect(result.current.ids).toEqual([])
  })

  it('lança erro descritivo quando usado fora do provider', () => {
    expect(() => renderHook(() => useCompareCursos())).toThrow(
      /CompareProvider/,
    )
  })
})
