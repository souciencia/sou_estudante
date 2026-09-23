import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { iesService } from './ies.service'

describe('iesService.searchIes', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta o endpoint de IES com busca, paginação e filtros', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 1,
        page: 2,
        limit: 10,
        results: [{ co_ies: '376', no_ies: 'ANHANGUERA', uf: 'SP' }],
        links: {
          self: '/ies?page=2',
          first: '/ies?page=1',
          last: '/ies?page=2',
        },
      }),
    })
    global.fetch = mockFetch

    const result = await iesService.searchIes('anhang', 2, 10, {
      uf: 'SP',
      regiao: 'Sudeste',
    })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/ies')
    expect(url).toContain('q=anhang')
    expect(url).toContain('page=2')
    expect(url).toContain('limit=10')
    expect(url).toContain('uf=SP')
    expect(url).toContain('regiao=Sudeste')
    expect(result.results).toHaveLength(1)
    expect(result.results[0].co_ies).toBe('376')
  })

  it('busca todas as IES quando não há termo (q opcional)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 0,
        page: 1,
        limit: 20,
        results: [],
        links: {
          self: '/ies?page=1',
          first: '/ies?page=1',
          last: '/ies?page=1',
        },
      }),
    })
    global.fetch = mockFetch

    await iesService.searchIes('', 1, 20)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/ies')
    expect(url).not.toContain('q=')
  })

  it('retorna resposta vazia quando a API falha', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    })

    const result = await iesService.searchIes('anhang')

    expect(result.results).toEqual([])
    expect(result.total).toBe(0)
  })
})

describe('iesService.sugerirIes', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta o endpoint de sugestões de IES com o termo', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: ['UNIVERSIDADE DE SÃO PAULO'] }),
    })
    global.fetch = mockFetch

    const result = await iesService.sugerirIes('  universidade  ')

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('/ies/sugestoes')
    expect(url).toContain('q=universidade')
    expect(result).toEqual(['UNIVERSIDADE DE SÃO PAULO'])
  })

  it('retorna lista vazia para termo curto sem chamar a API', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const result = await iesService.sugerirIes('a')

    expect(result).toEqual([])
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
