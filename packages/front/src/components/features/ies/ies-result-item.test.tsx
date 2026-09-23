import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import IesResultItem from './ies-result-item'

const ies = {
  co_ies: '376',
  no_ies: 'UNIVERSIDADE FEDERAL DO MATO GROSSO',
  sg_ies: 'UFMT',
  categoria_administrativa: 'Pública Federal',
  organizacao_academica: 'Universidade',
  municipio: 'Cuiabá',
  uf: 'MT',
  regiao: 'Centro-Oeste',
}

describe('IesResultItem', () => {
  it('renderiza nome, sigla, tags e localização da IES', () => {
    render(<IesResultItem ies={ies} module="4" />)

    expect(
      screen.getByText('UNIVERSIDADE FEDERAL DO MATO GROSSO'),
    ).toBeInTheDocument()
    expect(screen.getByText('• UFMT')).toBeInTheDocument()
    expect(screen.getByText('Pública Federal')).toBeInTheDocument()
    expect(screen.getByText('Universidade')).toBeInTheDocument()
    expect(screen.getByText('Centro-Oeste')).toBeInTheDocument()
    expect(screen.getByText('Cuiabá - MT')).toBeInTheDocument()
  })

  it('usa fallback quando o nome não está presente', () => {
    render(<IesResultItem ies={{ co_ies: '1' }} />)

    expect(screen.getByText('Instituição não especificada')).toBeInTheDocument()
  })

  it('expõe o tema via data-module', () => {
    const { container } = render(<IesResultItem ies={ies} module="4" />)

    expect(container.querySelector('[data-module]')).toHaveAttribute(
      'data-module',
      '4',
    )
  })
})
