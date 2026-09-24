import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cursoService } from './curso.service'
import type { Curso } from './types'
import { useCurso } from './use-curso'

vi.mock('./curso.service', () => ({
  cursoService: { getCurso: vi.fn() },
}))

const makeCurso = (): Curso => ({
  sequencial: 1,
  curso: { no_curso: 'MEDICINA', in_gratuito: false, cine: {} },
  instituicao: {},
  localizacao: { in_capital: true },
  censo_metricas: {},
  enade: {},
  tda: {},
  sisu: { tem_sisu: false, ofertas: [] },
})

describe('useCurso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes the course when found', async () => {
    vi.mocked(cursoService.getCurso).mockResolvedValue({
      success: true,
      data: makeCurso(),
    })

    const { result } = renderHook(() => useCurso('1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.curso?.sequencial).toBe(1)
    expect(result.current.notFound).toBe(false)
  })

  it('flags notFound when the API returns 404', async () => {
    vi.mocked(cursoService.getCurso).mockResolvedValue({
      success: false,
      error: { type: 'client', message: 'Not Found', statusCode: 404 },
    })

    const { result } = renderHook(() => useCurso('999'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.notFound).toBe(true)
    expect(result.current.curso).toBeNull()
  })

  it('surfaces an error when the request fails', async () => {
    vi.mocked(cursoService.getCurso).mockResolvedValue({
      success: false,
      error: { type: 'network', message: 'offline' },
    })

    const { result } = renderHook(() => useCurso('1'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.notFound).toBe(false)
  })
})
