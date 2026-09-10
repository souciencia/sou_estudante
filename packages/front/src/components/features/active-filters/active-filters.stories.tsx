import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActiveFilters } from './active-filters'

const meta = {
  component: ActiveFilters,
  title: 'Molecules/ActiveFilters',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {
          uf: 'SP,BA,RJ',
          turno: 'Noturno,Diurno',
          grau: 'Bacharelado',
          enade: '5',
          sort: 'enade',
        },
      },
    },
  },
} satisfies Meta<typeof ActiveFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <ActiveFilters />
    </div>
  ),
}

export const SingleFilter: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/cursos',
        query: {
          uf: 'SP',
        },
      },
    },
  },
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <ActiveFilters />
    </div>
  ),
}
