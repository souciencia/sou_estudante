import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MapPin } from 'lucide-react'
import { Profile } from './index'

const meta = {
  title: 'Components/Profile',
  component: Profile,
  tags: ['autodocs'],
} satisfies Meta<typeof Profile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    module: '1',
    children: (
      <>
        <Profile.TopBar backLabel="Resultados" backHref="/cursos">
          <button
            type="button"
            className="rounded-full bg-accent px-4 py-1 font-coadjuvant text-coadjuvant font-bold text-accent-fg"
          >
            Escolher curso
          </button>
        </Profile.TopBar>

        <Profile.Header
          badge="CARTA NÁUTICA"
          title="MEDICINA — BACHARELADO"
          subtitle="UNI-BH"
        />

        <Profile.Location
          icon={<MapPin className="size-6" />}
          eyebrow="Local de oferta"
          value="BELO HORIZONTE"
          source="Censo da Educação Superior"
          tag="MG"
          module="2"
        />

        <Profile.Tabs defaultValue="overview">
          <Profile.TabList>
            <Profile.Tab value="overview">Visão geral</Profile.Tab>
            <Profile.Tab value="quality">Qualidade</Profile.Tab>
          </Profile.TabList>
          <Profile.TabPanel value="overview">
            <Profile.Overview
              items={[
                { label: 'Grau', value: 'BACHARELADO' },
                { label: 'Turno', value: 'Diurno', note: 'com vagas · Censo' },
                { label: 'Modalidade', value: 'Presencial' },
              ]}
            />
          </Profile.TabPanel>
          <Profile.TabPanel value="quality">
            <p className="font-protagonist text-protagonist">
              Conteúdo da aba Qualidade.
            </p>
          </Profile.TabPanel>
        </Profile.Tabs>

        <Profile.Section title="Continue sua rota">
          <p className="font-protagonist text-protagonist text-fg-muted">
            Cards de rota entram aqui.
          </p>
        </Profile.Section>
      </>
    ),
  },
}
