import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cursoService } from './curso.service'
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
      'MEDICINA',
      'MEDICINA VETERINÁRIA',
    ])

    const { result } = renderHook(() => useSugestoesCursos('medicina'))

    await waitFor(() => {
      expect(cursoService.sugerirCursos).toHaveBeenCalledWith('medicina')
      expect(result.current.sugestoes).toEqual([
        'MEDICINA',
        'MEDICINA VETERINÁRIA',
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
    const resolvers: Array<(value: string[]) => void> = []
    vi.mocked(cursoService.sugerirCursos).mockImplementation(
      () =>
        new Promise<string[]>((resolve) => {
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
      resolvers[0](['MEDICINA'])
    })
    expect(result.current.sugestoes).toEqual([])

    await act(async () => {
      resolvers[1](['DIREITO'])
    })
    await waitFor(() => {
      expect(result.current.sugestoes).toEqual(['DIREITO'])
    })
  })
})
