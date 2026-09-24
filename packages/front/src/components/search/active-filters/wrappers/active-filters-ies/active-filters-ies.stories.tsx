import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActiveFiltersIes } from './active-filters-ies'

const meta = {
  title: 'Components/Search/ActiveFilters/Wrappers/Ies',
  component: ActiveFiltersIes,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {
          uf: 'SP,RJ',
          regiao: 'Sudeste',
          categoria: 'Privada',
          sort: 'az',
        },
      },
    },
  },
} satisfies Meta<typeof ActiveFiltersIes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <ActiveFiltersIes module="4" />
    </div>
  ),
}

export const SingleFilter: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/ies',
        query: {
          uf: 'SP',
        },
      },
    },
  },
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <ActiveFiltersIes module="4" />
    </div>
  ),
}
