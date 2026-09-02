import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CourseFilters } from './course-filters'

const meta = {
  component: CourseFilters,
  title: 'Organisms/CourseFilters',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {},
      },
    },
  },
} satisfies Meta<typeof CourseFilters>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-80 p-4 border rounded-md bg-white">
      <CourseFilters />
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
      <CourseFilters />
    </div>
  ),
}
