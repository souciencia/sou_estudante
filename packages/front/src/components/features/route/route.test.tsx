import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route } from './route'

const routes = [
  {
    module: '1',
    bloc: {
      title: 'Escolher curso',
      description: 'Explore por área, localização e modalidade',
    },
    list: {
      title: 'Escolha um curso',
      description:
        'A carta náutica mapeia as rotas possíveis: explore os cursos por área, local e modalidade.',
    },
    badge: 'CARTA NÁUTICA',
  },
  {
    module: '2',
    bloc: {
      title: 'Como ingressar',
      description: 'Notas de corte, vagas e cotas no Sisu',
    },
    list: {
      title: 'Veja como ingressar',
      description:
        'A bússola aponta o caminho da entrada: notas de corte, vagas e cotas no Sisu.',
    },
    badge: 'BÚSSOLA',
  },
  {
    module: '3',
    bloc: {
      title: 'Como permanecer',
      description: 'Cotas, assistência e apoios estudantis',
    },
    list: {
      title: 'Encontre apoio para permanecer',
      description:
        'A âncora segura você no percurso: bolsas, cotas e apoios para chegar até a formatura.',
    },
    badge: 'ÂNCORA',
  },
  {
    module: '4',
    bloc: {
      title: 'Conhecer instituição',
      description: 'Indicadores, docentes e qualidade',
    },
    list: {
      title: 'Conheça a instituição',
      description:
        'O telescópio aproxima o que está longe: os indicadores oficiais da instituição, traduzidos.',
    },
    badge: 'TELESCÓPIO',
  },
  {
    module: '5',
    bloc: {
      title: 'Comparar cursos',
      description: 'Analise até 4 cursos lado a lado',
    },
    list: {
      title: 'Compare lado a lado',
      description:
        'O sextante mede posições para orientar a escolha: até quatro cursos comparados pelos mesmos critérios, sem ranking.',
    },
    badge: 'SEXTANTE',
  },
] as const

describe('Route', () => {
  describe.each(routes)(
    'Módulo $module - $bloc.title',
    ({ module, bloc, badge }) => {
      const setup = () =>
        render(
          <div>
            <Route module={module} />
          </div>,
        )

      it('renders the correct heading title', () => {
        setup()

        expect(
          screen.getByRole('heading', {
            level: 3,
            name: bloc.title,
          }),
        ).toBeInTheDocument()
      })

      it('renders the correct description text', () => {
        setup()

        expect(screen.getByText(bloc.description)).toBeInTheDocument()
      })

      it('renders the correct badge text', () => {
        setup()

        expect(screen.getByText(badge)).toBeInTheDocument()
      })

      it("renders a link pointing to '#'", () => {
        setup()

        expect(screen.getByRole('link')).toHaveAttribute('href', '#')
      })

      it('contains the correct data-module attribute', () => {
        setup()

        expect(screen.getByRole('link')).toHaveAttribute(
          'data-module',
          module,
        )
      })

      it('renders an SVG icon inside the route component', () => {
        const { container } = setup()
        const route = container.querySelector(`[data-module="${module}"]`)

        expect(route?.querySelector('svg')).toBeInTheDocument()
      })
    },
  )

  describe.each(routes)(
    'Módulo $module - variante list',
    ({ module, list, badge }) => {
      const setup = () =>
        render(
          <div>
            <Route module={module} variant="list" />
          </div>,
        )

      it('renders the list title', () => {
        setup()

        expect(
          screen.getByRole('heading', {
            level: 3,
            name: list.title,
          }),
        ).toBeInTheDocument()
      })

      it('renders the list description', () => {
        setup()

        expect(screen.getByText(list.description)).toBeInTheDocument()
      })

      it('renders the module badge', () => {
        setup()

        expect(screen.getByText(badge)).toBeInTheDocument()
      })

      it("renders a link pointing to '#'", () => {
        setup()

        expect(screen.getByRole('link')).toHaveAttribute('href', '#')
      })

      it('contains the correct data-module attribute', () => {
        setup()

        expect(screen.getByRole('link')).toHaveAttribute(
          'data-module',
          module,
        )
      })
    },
  )
})