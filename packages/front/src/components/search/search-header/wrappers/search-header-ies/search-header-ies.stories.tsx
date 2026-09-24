import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchHeaderIes } from './search-header-ies'

const meta = {
  title: 'Components/Search/SearchHeader/Wrappers/Ies',
  component: SearchHeaderIes,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {},
      },
    },
  },
} satisfies Meta<typeof SearchHeaderIes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SearchHeaderIes module="4" />
    </div>
  ),
}

export const WithQuery: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/ies',
        query: {
          q: 'universidade',
          sort: 'relevancia',
        },
      },
    },
  },
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SearchHeaderIes module="4" />
    </div>
  ),
}
