import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FiltersPanelCursos } from './filters-panel-cursos'

const meta = {
  component: FiltersPanelCursos,
  title: 'Components/Search/FiltersPanel/Wrappers/Cursos',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {},
      },
    },
  },
} satisfies Meta<typeof FiltersPanelCursos>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <FiltersPanelCursos />
    </div>
  ),
}

export const WithSelectedFilters: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/cursos',
        query: {
          uf: 'SP,RJ',
          turno: 'Noturno,Diurno',
          grau: 'Bacharelado',
          enade: '5',
        },
      },
    },
  },
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <FiltersPanelCursos />
    </div>
  ),
}
