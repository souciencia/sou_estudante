import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { API_CONFIG } from './config'

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Casos de sucesso', () => {
    it('deve retornar dados quando request é bem-sucedido', async () => {
      const mockData = { results: ['test'] }
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
      global.fetch = mockFetch

      const result = await apiClient('/test')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockData)
      }
    })

    it('deve usar BASE_URL do config', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      await apiClient('/search')

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/search`,
        expect.any(Object),
      )
    })

    it('deve aplicar configuração de cache do Next.js', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })
      global.fetch = mockFetch

      await apiClient('/test')

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), {
        next: {
          revalidate: API_CONFIG.CACHE.REVALIDATE_SECONDS,
        },
      })
    })
  })

  describe('Erros HTTP', () => {
    it("deve retornar erro tipo 'server' para status 5xx", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })
      global.fetch = mockFetch

      const result = await apiClient('/test')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('server')
        expect(result.error.statusCode).toBe(500)
      }
    })

    it("deve retornar erro tipo 'client' para status 4xx", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })
      global.fetch = mockFetch

      const result = await apiClient('/test')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('client')
        expect(result.error.statusCode).toBe(404)
      }
    })
  })

  describe('Erros de parsing', () => {
    it("deve retornar erro tipo 'parse' quando JSON é inválido", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })
      global.fetch = mockFetch

      const result = await apiClient('/test')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('parse')
      }
    })
  })

  describe('Erros de rede', () => {
    it("deve retornar erro tipo 'network' quando fetch falha", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      global.fetch = mockFetch

      const result = await apiClient('/test')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.type).toBe('network')
      }
    })
  })
})
