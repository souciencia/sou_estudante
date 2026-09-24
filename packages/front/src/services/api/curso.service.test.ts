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

describe('cursoService.getCurso', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta o endpoint do curso pelo id', async () => {
    const curso = { sequencial: 123, curso: { no_curso: 'MEDICINA' } }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => curso,
    })
    global.fetch = mockFetch

    const result = await cursoService.getCurso('123')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/cursos/123')
    expect(result).toEqual({ success: true, data: curso })
  })

  it('falha sem chamar a API quando o id é vazio', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const result = await cursoService.getCurso('   ')

    expect(result.success).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('preserva o status 404 do erro da API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const result = await cursoService.getCurso('999')

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.statusCode).toBe(404)
    }
  })
})
