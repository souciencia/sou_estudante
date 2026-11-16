import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cursoService } from './curso.service'
import type { Sugestao } from './types'
import { useSugestoesCursos } from './use-sugestoes-cursos'

vi.mock('./curso.service', () => ({
  cursoService: { sugerirCursos: vi.fn() },
}))

describe('useSugestoesCursos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('busca sugestões para o termo informado', async () => {
    vi.mocked(cursoService.sugerirCursos).mockResolvedValue([
      { nome: 'MEDICINA', count: 2 },
      { nome: 'MEDICINA VETERINÁRIA', count: 5 },
    ])

    const { result } = renderHook(() => useSugestoesCursos('medicina'))

    await waitFor(() => {
      expect(cursoService.sugerirCursos).toHaveBeenCalledWith('medicina')
      expect(result.current.sugestoes).toEqual([
        { nome: 'MEDICINA', count: 2 },
        { nome: 'MEDICINA VETERINÁRIA', count: 5 },
      ])
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('não busca sugestões para termo abaixo do mínimo', () => {
    const { result } = renderHook(() => useSugestoesCursos('a'))

    expect(result.current.sugestoes).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(cursoService.sugerirCursos).not.toHaveBeenCalled()
  })

  it('ignora respostas obsoletas quando o termo muda', async () => {
    const resolvers: Array<(value: Sugestao[]) => void> = []
    vi.mocked(cursoService.sugerirCursos).mockImplementation(
      () =>
        new Promise<Sugestao[]>((resolve) => {
          resolvers.push(resolve)
        }),
    )

    const { result, rerender } = renderHook(
      ({ termo }: { termo: string }) => useSugestoesCursos(termo),
      { initialProps: { termo: 'medicina' } },
    )

    rerender({ termo: 'direito' })

    expect(cursoService.sugerirCursos).toHaveBeenCalledTimes(2)

    await act(async () => {
      resolvers[0]([{ nome: 'MEDICINA', count: 0 }])
    })
    expect(result.current.sugestoes).toEqual([])

    await act(async () => {
      resolvers[1]([{ nome: 'DIREITO', count: 0 }])
    })
    await waitFor(() => {
      expect(result.current.sugestoes).toEqual([{ nome: 'DIREITO', count: 0 }])
    })
  })
})
