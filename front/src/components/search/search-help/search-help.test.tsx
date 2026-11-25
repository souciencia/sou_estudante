import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SearchHelp } from './search-help'

describe('SearchHelp', () => {
  it('renderiza o botão com o rótulo de ajuda', () => {
    render(<SearchHelp />)

    expect(
      screen.getByRole('button', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    ).toBeInTheDocument()
  })

  it('abre o diálogo explicativo ao clicar no botão', async () => {
    const user = userEvent.setup()
    render(<SearchHelp />)

    await user.click(
      screen.getByRole('button', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    )

    expect(
      screen.getByRole('dialog', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/os resultados aparecem a partir de 5 letras/i),
    ).toBeInTheDocument()
  })

  it('exibe as seções de interpretação de dados com fonte e ano de referência', async () => {
    const user = userEvent.setup()
    render(<SearchHelp />)

    await user.click(
      screen.getByRole('button', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    )

    expect(screen.getByText('Como interpretar esses dados')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'O que significa o Conceito Enade?',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Enade ciclo 2021–2023 · INEP')).toBeInTheDocument()
  })

  it('exibe a seção Comparar com as explicações e as imagens', async () => {
    const user = userEvent.setup()
    render(<SearchHelp />)

    await user.click(
      screen.getByRole('button', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    )

    expect(
      screen.getByRole('heading', { name: 'Você pode comparar cursos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Como incluir um curso na comparação?',
      }),
    ).toBeInTheDocument()

    const resultado = screen.getByAltText(
      /Interruptor "Incluir na comparação"/i,
    ) as HTMLImageElement
    const botao = screen.getByAltText(
      /Barra de comparação/i,
    ) as HTMLImageElement
    const perfil = screen.getByAltText(
      /Botão "Comparar" dentro do perfil/i,
    ) as HTMLImageElement

    expect(resultado.getAttribute('src')).toContain(
      'comparar-incluir-resultado.png',
    )
    expect(botao.getAttribute('src')).toContain('comparar-botao.png')
    expect(perfil.getAttribute('src')).toContain('comparar-incluir-perfil.png')
  })

  it('fecha o diálogo pelo botão de fechar', async () => {
    const user = userEvent.setup()
    render(<SearchHelp />)

    await user.click(
      screen.getByRole('button', {
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Fechar ajuda' }))

    expect(
      screen.getByRole('dialog', {
        hidden: true,
        name: 'Entenda como pesquisar no SoU_Estudante',
      }),
    ).toHaveAttribute('inert', '')
  })

  it('emite o tema do módulo via data-module', () => {
    const { container } = render(<SearchHelp module="2" />)

    expect(container.firstChild).toHaveAttribute('data-module', '2')
  })
})
