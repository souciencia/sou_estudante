import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CompareBar } from './compare-bar'
import { CompareProvider, useCompareCursos } from './compare-provider'

function Harness({ ids }: { ids: string[] }) {
  const { toggle, setComparing } = useCompareCursos()
  return (
    <>
      <button
        type="button"
        onClick={() => {
          for (const id of ids) toggle(id)
        }}
      >
        seed
      </button>
      <button type="button" onClick={() => setComparing(true)}>
        enable
      </button>
      <CompareBar module="1" />
    </>
  )
}

function renderBar(ids: string[]) {
  return render(
    <CompareProvider>
      <Harness ids={ids} />
    </CompareProvider>,
  )
}

describe('CompareBar', () => {
  it('não renderiza quando o modo de comparação está desligado', () => {
    renderBar(['101', '102'])

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))

    expect(
      screen.queryByRole('link', { name: /Comparar/ }),
    ).not.toBeInTheDocument()
  })

  it('não renderiza com menos de dois cursos selecionados', () => {
    renderBar(['101'])

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))
    fireEvent.click(screen.getByRole('button', { name: 'enable' }))

    expect(
      screen.queryByRole('link', { name: /Comparar/ }),
    ).not.toBeInTheDocument()
  })

  it('renderiza o resumo e o link ao ligar a comparação com 2+ selecionados', () => {
    renderBar(['101', '102'])

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))
    fireEvent.click(screen.getByRole('button', { name: 'enable' }))

    expect(screen.getByText(/2 de 5 cursos selecionados/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comparar (2)' })).toHaveAttribute(
      'href',
      '/comparar',
    )
  })

  it('limpa a seleção ao clicar no botão de limpar', () => {
    renderBar(['101', '102'])

    fireEvent.click(screen.getByRole('button', { name: 'seed' }))
    fireEvent.click(screen.getByRole('button', { name: 'enable' }))

    fireEvent.click(screen.getByRole('button', { name: 'Limpar comparação' }))

    expect(
      screen.queryByRole('link', { name: /Comparar/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/cursos selecionados para comparar/),
    ).not.toBeInTheDocument()
  })
})
