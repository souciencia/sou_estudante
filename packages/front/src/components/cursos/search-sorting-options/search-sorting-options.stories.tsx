import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchSortingOptions } from './search-sorting-options'

const meta = {
  component: SearchSortingOptions,
  title: 'Components/Cursos/SearchSortingOptions',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
        query: {},
      },
    },
  },
} satisfies Meta<typeof SearchSortingOptions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SearchSortingOptions />
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
      <SearchSortingOptions />
    </div>
  ),
}
