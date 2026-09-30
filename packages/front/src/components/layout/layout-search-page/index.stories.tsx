import type { Meta, StoryObj } from '@storybook/react'
import { LayoutSearchPage } from '.'

const slot = (label: string) => (
  <div className="rounded-md border border-dashed border-fg-muted p-4 text-coadjuvant text-fg-muted">
    {label}
  </div>
)

const meta = {
  title: 'Components/Layouts/LayoutSearchPage',
  component: LayoutSearchPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LayoutSearchPage>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Busca de Cursos',
    searchHeader: slot('Cabeçalho de busca'),
    filtersPanel: slot('Painel de filtros'),
    activeFilters: slot('Filtros ativos'),
    results: slot('Resultados'),
  },
}
