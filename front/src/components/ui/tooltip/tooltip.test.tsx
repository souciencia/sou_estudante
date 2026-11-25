import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './index'

describe('Tooltip', () => {
  it('expõe o módulo via data-module no elemento raiz', () => {
    const { container } = render(
      <Tooltip module="3">
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo</Tooltip.Content>
      </Tooltip>,
    )
    expect(container.firstChild).toHaveAttribute('data-module', '3')
  })

  it('omite data-module quando nenhum módulo é informado', () => {
    const { container } = render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo</Tooltip.Content>
      </Tooltip>,
    )
    expect(container.firstChild).not.toHaveAttribute('data-module')
  })

  it('renderiza o ícone como botão com o hover "Clique para saber mais"', () => {
    render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo</Tooltip.Content>
      </Tooltip>,
    )

    const trigger = screen.getByRole('button', {
      name: 'Clique para saber mais',
    })
    expect(trigger).toHaveAttribute('title', 'Clique para saber mais')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('não exibe o conteúdo antes do clique', () => {
    render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo explicativo</Tooltip.Content>
      </Tooltip>,
    )
    expect(screen.queryByText('Conteúdo explicativo')).not.toBeInTheDocument()
  })

  it('abre o conteúdo ao clicar no ícone e move o foco para fechar', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo explicativo</Tooltip.Content>
      </Tooltip>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    )

    expect(screen.getByText('Conteúdo explicativo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
  })

  it('fecha pelo botão de fechar e devolve o foco ao ícone', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo explicativo</Tooltip.Content>
      </Tooltip>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    )
    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(screen.queryByText('Conteúdo explicativo')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    ).toHaveFocus()
  })

  it('fecha ao pressionar Escape dentro do conteúdo', async () => {
    const user = userEvent.setup()
    render(
      <Tooltip>
        <Tooltip.Icon />
        <Tooltip.Content>Conteúdo explicativo</Tooltip.Content>
      </Tooltip>,
    )

    await user.click(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    )
    await user.keyboard('{Escape}')

    expect(screen.queryByText('Conteúdo explicativo')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Clique para saber mais' }),
    ).toHaveFocus()
  })

  it('aceita um rótulo customizado para o ícone', () => {
    render(
      <Tooltip>
        <Tooltip.Icon label="Saiba mais sobre o Sisu" />
        <Tooltip.Content>Conteúdo</Tooltip.Content>
      </Tooltip>,
    )
    expect(
      screen.getByRole('button', { name: 'Saiba mais sobre o Sisu' }),
    ).toBeInTheDocument()
  })
})
