import { fireEvent, render, screen } from '@testing-library/react'
import { MapPin } from 'lucide-react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Profile } from './index'
import { ProfileHeader } from './profile-header'
import { ProfileTab } from './profile-tab'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))

const renderTabs = (defaultValue = 'overview') =>
  render(
    <Profile module="1">
      <Profile.Tabs defaultValue={defaultValue}>
        <Profile.TabList>
          <Profile.Tab value="overview">Visão geral</Profile.Tab>
          <Profile.Tab value="quality">Qualidade</Profile.Tab>
        </Profile.TabList>
        <Profile.TabPanel value="overview">Conteúdo geral</Profile.TabPanel>
        <Profile.TabPanel value="quality">Conteúdo qualidade</Profile.TabPanel>
      </Profile.Tabs>
    </Profile>,
  )

describe('Profile', () => {
  it('renders the header, location and overview content', () => {
    render(
      <Profile module="1">
        <Profile.Header
          badge="CARTA NÁUTICA"
          title="MEDICINA — BACHARELADO"
          subtitle="UNI-BH"
        />
        <Profile.Location
          icon={<MapPin />}
          eyebrow="Local de oferta"
          value="BELO HORIZONTE"
          tag="MG"
        />
        <Profile.Overview items={[{ label: 'Grau', value: 'BACHARELADO' }]} />
      </Profile>,
    )

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'MEDICINA — BACHARELADO',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('BELO HORIZONTE')).toBeInTheDocument()
    expect(screen.getByText('BACHARELADO')).toBeInTheDocument()
  })

  it('shows only the active panel and switches on click', () => {
    renderTabs()

    expect(screen.getByText('Conteúdo geral')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo qualidade')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Qualidade' }))

    expect(screen.getByText('Conteúdo qualidade')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo geral')).not.toBeInTheDocument()
  })

  it('moves selection to the next tab with ArrowRight', () => {
    renderTabs()

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Visão geral' }), {
      key: 'ArrowRight',
    })

    expect(screen.getByRole('tab', { name: 'Qualidade' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Conteúdo qualidade')).toBeInTheDocument()
  })

  it('renders the top bar back link and action', () => {
    render(
      <Profile module="1">
        <Profile.TopBar backLabel="Resultados" backHref="/cursos">
          <button type="button">Escolher curso</button>
        </Profile.TopBar>
      </Profile>,
    )

    expect(
      screen.getByRole('button', { name: 'Resultados' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Escolher curso' }),
    ).toBeInTheDocument()
  })

  it('omits overview items without a value', () => {
    render(
      <Profile module="1">
        <Profile.Overview
          items={[
            { label: 'Grau', value: 'BACHARELADO' },
            { label: 'Categoria' },
          ]}
        />
      </Profile>,
    )

    expect(screen.queryByText('Categoria')).not.toBeInTheDocument()
  })

  describe('usage validation', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('throws when Profile.Tab is used outside Profile.Tabs', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() =>
        render(
          <Profile module="1">
            <ProfileTab value="overview">Visão geral</ProfileTab>
          </Profile>,
        ),
      ).toThrow(/must be rendered inside <Profile.Tabs>/)
    })

    it('throws when Profile.Header is used outside Profile', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() =>
        render(<ProfileHeader badge="CARTA NÁUTICA" title="MEDICINA" />),
      ).toThrow(/must be rendered inside <Profile>/)
    })
  })
})
