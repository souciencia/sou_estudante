import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActiveFiltersCursos } from './active-filters-cursos'

const meta = {
  component: ActiveFiltersCursos,
  title: 'Components/Search/ActiveFilters/Wrappers/Cursos',
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
} satisfies Meta<typeof ActiveFiltersCursos>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="p-4 bg-white border rounded-md">
      <ActiveFiltersCursos />
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
      <ActiveFiltersCursos />
    </div>
  ),
}
