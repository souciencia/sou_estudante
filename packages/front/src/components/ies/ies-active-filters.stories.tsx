import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IesActiveFilters } from './ies-active-filters'

const meta = {
  title: 'Molecules/IesActiveFilters',
  component: IesActiveFilters,
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
} satisfies Meta<typeof IesActiveFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <IesActiveFilters module="4" />
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
      <IesActiveFilters module="4" />
    </div>
  ),
}
