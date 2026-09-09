import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cursoService } from './curso.service'

describe('cursoService.sugerirCursos', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta o endpoint de sugestões com o termo', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: ['MEDICINA', 'MEDICINA VETERINÁRIA'],
      }),
    })
    global.fetch = mockFetch

    const result = await cursoService.sugerirCursos('medicina')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/cursos/sugestoes')
    expect(url).toContain('q=medicina')
    expect(result).toEqual(['MEDICINA', 'MEDICINA VETERINÁRIA'])
  })

  it('retorna lista vazia para termo curto sem chamar a API', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const result = await cursoService.sugerirCursos('a')

    expect(result).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('retorna lista vazia quando a API falha', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const result = await cursoService.sugerirCursos('medicina')

    expect(result).toEqual([])
  })

  it('envia o termo sem espaços nas bordas', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    })
    global.fetch = mockFetch

    await cursoService.sugerirCursos('  medicina  ')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('q=medicina')
  })
})
