import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { cursoService } from '@/services/api/curso.service'
import type { Curso } from '@/services/api/types'
import { Comparar } from './comparar'
import { CompareProvider, useCompareCursos } from './compare-provider'

vi.mock('@/services/api/curso.service', () => ({
  cursoService: { getCurso: vi.fn() },
}))

const buildCurso = (): Curso => ({
  sequencial: 101,
  instituicao: { no_ies: 'UFMG' },
  curso: {
    no_curso: 'Ciência da Computação',
    in_gratuito: true,
    cine: {},
  },
  localizacao: { in_capital: true },
  censo_metricas: {},
  enade: {},
  tda: {},
  sisu: { tem_sisu: false, ofertas: [] },
})

function Seeder({ ids }: { ids: string[] }) {
  const { toggle } = useCompareCursos()
  return (
    <button
      type="button"
      onClick={() => {
        for (const id of ids) toggle(id)
      }}
    >
      seed
    </button>
  )
}

function renderComparar(ids: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <CompareProvider>
        <Seeder ids={ids} />
        <Comparar module="5" />
      </CompareProvider>
    </QueryClientProvider>,
  )
}

describe('Comparar', () => {
  it('busca e exibe os cursos selecionados na matriz', async () => {
    vi.mocked(cursoService.getCurso).mockResolvedValue({
      success: true,
      data: buildCurso(),
    })

    renderComparar(['101', '102'])

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))

    await waitFor(() => {
      expect(screen.getAllByText('Ciência da Computação').length).toBe(2)
    })
  })
})
