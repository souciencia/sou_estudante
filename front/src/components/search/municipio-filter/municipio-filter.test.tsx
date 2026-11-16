import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MunicipioFilter } from './municipio-filter'

const options = [
  { codigo: '3509502', nome: 'Campinas' },
  { codigo: '3550308', nome: 'São Paulo' },
  { codigo: '3548708', nome: 'São Bernardo do Campo' },
  { codigo: '3520509', nome: 'Indaiatuba' },
]

describe('MunicipioFilter', () => {
  it('abre a lista de municípios ao clicar no gatilho', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
      />,
    )

    const trigger = screen.getByRole('button', {
      name: 'Municípios de São Paulo',
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('checkbox', { name: 'Campinas' }),
    ).toBeInTheDocument()
  })

  it('move os itens selecionados para o topo da lista', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={['3550308']}
        onToggle={() => {}}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )

    const order = screen
      .getAllByRole('checkbox')
      .map((checkbox) => checkbox.closest('label')?.textContent?.trim())

    expect(order).toEqual([
      'São Paulo',
      'Campinas',
      'Indaiatuba',
      'São Bernardo do Campo',
    ])
  })

  it('dispara onToggle com o código IBGE ao marcar um município', () => {
    const onToggle = vi.fn()
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={onToggle}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'Campinas' }))

    expect(onToggle).toHaveBeenCalledWith('3509502')
  })

  it('exibe a contagem de selecionados no gatilho', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={['3550308', '3509502']}
        onToggle={() => {}}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    ).toHaveTextContent('2')
  })

  it('expõe o tema via data-module', () => {
    const { container } = render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
        module="2"
      />,
    )

    expect(container.firstChild).toHaveAttribute('data-module', '2')
  })

  it('filtra os municípios pela barra de busca', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Buscar municípios' }),
      { target: { value: 'camp' } },
    )

    expect(
      screen.getByRole('checkbox', { name: 'Campinas' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'São Paulo' }),
    ).not.toBeInTheDocument()
  })

  it('busca ignorando acentos', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Buscar municípios' }),
      { target: { value: 'sao' } },
    )

    expect(
      screen.getByRole('checkbox', { name: 'São Paulo' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'São Bernardo do Campo' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('checkbox', { name: 'Campinas' }),
    ).not.toBeInTheDocument()
  })

  it('mostra estado vazio quando nada coincide', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Buscar municípios' }),
      { target: { value: 'zzzz' } },
    )

    expect(screen.getByText('Nenhum município encontrado')).toBeInTheDocument()
  })

  it('desabilita municípios sem resultado na busca', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
        availableCodigos={new Set(['3550308', '3509502'])}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )

    expect(screen.getByRole('checkbox', { name: 'Campinas' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'São Paulo' })).toBeEnabled()
    expect(
      screen.getByRole('checkbox', { name: 'São Bernardo do Campo' }),
    ).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Indaiatuba' })).toBeDisabled()
  })

  it('mantém habilitados os municípios já selecionados mesmo sem resultado', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={['3520509']}
        onToggle={() => {}}
        availableCodigos={new Set(['3550308'])}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )

    expect(screen.getByRole('checkbox', { name: 'Indaiatuba' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { name: 'Indaiatuba' })).toBeChecked()
  })

  it('coloca os municípios habilitados no topo, em ordem alfabética', () => {
    render(
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={options}
        selected={[]}
        onToggle={() => {}}
        availableCodigos={new Set(['3550308', '3509502'])}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Municípios de São Paulo' }),
    )

    const order = screen
      .getAllByRole('checkbox')
      .map((checkbox) => checkbox.closest('label')?.textContent?.trim())

    expect(order).toEqual([
      'Campinas',
      'São Paulo',
      'Indaiatuba',
      'São Bernardo do Campo',
    ])
  })
})
