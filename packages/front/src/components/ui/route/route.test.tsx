import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Route } from './route'

const routes = [
  {
    module: '1',
    title: 'Escolher curso',
    description: 'Explore por área, localização e modalidade',
    badge: 'CARTA NÁUTICA',
    list: {
      title: 'Escolha um curso',
      description:
        'A carta náutica mapeia as rotas possíveis: explore os cursos por área, local e modalidade.',
    },
    href: '#',
  },
  {
    module: '2',
    title: 'Como ingressar',
    description: 'Notas de corte, vagas e cotas no Sisu',
    badge: 'BÚSSOLA',
    list: {
      title: 'Veja como ingressar',
      description:
        'A bússola aponta o caminho da entrada: notas de corte, vagas e cotas no Sisu.',
    },
    href: '#',
  },
  {
    module: '3',
    title: 'Como permanecer',
    description: 'Cotas, assistência e apoios estudantis',
    badge: 'ÂNCORA',
    list: {
      title: 'Encontre apoio para permanecer',
      description:
        'A âncora segura você no percurso: bolsas, cotas e apoios para chegar até a formatura.',
    },
    href: '#',
  },
  {
    module: '4',
    title: 'Conhecer instituição',
    description: 'Indicadores, docentes e qualidade',
    badge: 'TELESCÓPIO',
    list: {
      title: 'Conheça a instituição',
      description:
        'O telescópio aproxima o que está longe: os indicadores oficiais da instituição, traduzidos.',
    },
    href: '/ies',
  },
  {
    module: '5',
    title: 'Comparar cursos',
    description: 'Analise até 4 cursos lado a lado',
    badge: 'SEXTANTE',
    list: {
      title: 'Compare lado a lado',
      description:
        'O sextante mede posições para orientar a escolha: até quatro cursos comparados pelos mesmos critérios, sem ranking.',
    },
    href: '#',
  },
] as const

describe('Route', () => {
  describe.each(routes)(
    'Módulo $module - $title',
    ({ module, title, description, badge, href }) => {
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
            name: title,
          }),
        ).toBeInTheDocument()
      })

      it('renders the correct description text', () => {
        setup()
        expect(screen.getByText(description)).toBeInTheDocument()
      })

      it('renders the correct badge text', () => {
        setup()
        expect(screen.getByText(badge)).toBeInTheDocument()
      })

      it(`renders a link pointing to '${href}'`, () => {
        setup()
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', href)
      })

      it('contains the correct data-module attribute', () => {
        const { container } = setup()
        const route = container.querySelector(`[data-module="${module}"]`)
        expect(route).toBeInTheDocument()
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

      it('contains the correct data-module attribute', () => {
        setup()

        expect(screen.getByRole('link')).toHaveAttribute('data-module', module)
      })
    },
  )

  describe('inline variant', () => {
    it('links to the module destination using the given copy', () => {
      render(
        <Route
          module="4"
          variant="inline"
          title="Conheça a instituição"
          description="Indicadores oficiais e perfil da IES — Telescópio"
        />,
      )

      expect(screen.getByRole('link')).toHaveAttribute('href', '/ies')
      expect(screen.getByText('Conheça a instituição')).toBeInTheDocument()
      expect(
        screen.getByText('Indicadores oficiais e perfil da IES — Telescópio'),
      ).toBeInTheDocument()
    })

    it('does not render the module badge', () => {
      render(
        <Route
          module="3"
          variant="inline"
          title="Vou conseguir me manter?"
          description="Bolsas, cotas e apoios à permanência — Âncora"
        />,
      )

      expect(screen.queryByText('ÂNCORA')).not.toBeInTheDocument()
    })
  })
})
