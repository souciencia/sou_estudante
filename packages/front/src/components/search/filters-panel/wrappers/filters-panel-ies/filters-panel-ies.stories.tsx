import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FiltersPanelIes } from './filters-panel-ies'

const meta = {
  title: 'Components/Search/FiltersPanel/Wrappers/Ies',
  component: FiltersPanelIes,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {},
      },
    },
  },
} satisfies Meta<typeof FiltersPanelIes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <FiltersPanelIes module="4" />
    </div>
  ),
}

export const WithSelectedFilters: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/ies',
        query: {
          uf: 'SP,RJ',
          regiao: 'Sudeste',
          categoria: 'Privada',
        },
      },
    },
  },
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <FiltersPanelIes module="4" />
    </div>
  ),
}
