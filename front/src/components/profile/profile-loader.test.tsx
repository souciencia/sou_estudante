import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileLoader, type ProfileLoaderProps } from './profile-loader'

type Item = { nome: string }

const baseProps: Omit<ProfileLoaderProps<Item>, 'children'> = {
  data: null,
  isLoading: false,
  error: null,
  notFound: false,
  notFoundTitle: 'Item não encontrado',
  notFoundDescription: 'O item não existe.',
  fallbackError: 'Não foi possível carregar o item.',
  backHref: '/itens',
}

const renderLoader = (props: Partial<typeof baseProps> = {}) =>
  render(
    <ProfileLoader<Item> {...baseProps} {...props}>
      {(item) => <p>Perfil de {item.nome}</p>}
    </ProfileLoader>,
  )

describe('ProfileLoader', () => {
  it('mostra um spinner enquanto carrega, sem chamar o conteúdo', () => {
    renderLoader({ isLoading: true })
    expect(screen.queryByText(/Perfil de/)).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('mostra o 404 com link de volta quando não encontrado', () => {
    renderLoader({ notFound: true })
    expect(
      screen.getByRole('heading', { name: 'Item não encontrado' }),
    ).toBeInTheDocument()
    expect(screen.getByText('O item não existe.')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar à busca' }),
    ).toHaveAttribute('href', '/itens')
  })

  it('mostra a mensagem de erro recebida', () => {
    renderLoader({ error: 'Falha de rede' })
    expect(screen.getByText('Falha de rede')).toBeInTheDocument()
  })

  it('usa a mensagem padrão quando não há dados nem erro', () => {
    renderLoader()
    expect(
      screen.getByText('Não foi possível carregar o item.'),
    ).toBeInTheDocument()
  })

  it('renderiza o conteúdo do domínio quando há dados', () => {
    renderLoader({ data: { nome: 'Direito' } })
    expect(screen.getByText('Perfil de Direito')).toBeInTheDocument()
  })
})
