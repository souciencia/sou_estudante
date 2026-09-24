import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SortingOptionsCursos } from './sorting-options-cursos'

const meta = {
  component: SortingOptionsCursos,
  title: 'Components/Search/SortingOptions/Wrappers/Cursos',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {},
      },
    },
  },
} satisfies Meta<typeof SortingOptionsCursos>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SortingOptionsCursos />
    </div>
  ),
}

export const WithQuery: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/cursos',
        query: {
          q: 'Engenharia de Software',
          sort: 'enade',
        },
      },
    },
  },
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SortingOptionsCursos />
    </div>
  ),
}
