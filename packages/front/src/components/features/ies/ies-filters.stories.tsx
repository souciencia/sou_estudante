import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IesFilters } from './ies-filters'

const meta = {
  title: 'Organisms/IesFilters',
  component: IesFilters,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {},
      },
    },
  },
} satisfies Meta<typeof IesFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <IesFilters module="4" />
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
      <IesFilters module="4" />
    </div>
  ),
}
