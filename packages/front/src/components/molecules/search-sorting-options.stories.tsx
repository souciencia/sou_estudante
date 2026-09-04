import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchOptions } from '../organisms/search-header'

const meta = {
  component: SearchOptions,
  title: 'Organisms/SearchOptions',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {},
      },
    },
  },
} satisfies Meta<typeof SearchOptions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SearchOptions />
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
      <SearchOptions />
    </div>
  ),
}
