import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SortingOptionsIes } from './sorting-options-ies'

const meta = {
  component: SortingOptionsIes,
  title: 'Components/Search/SortingOptions/Wrappers/Ies',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {},
      },
    },
  },
} satisfies Meta<typeof SortingOptionsIes>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SortingOptionsIes />
    </div>
  ),
}

export const WithQuery: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/ies',
        query: {
          q: 'Universidade',
          sort: 'az',
        },
      },
    },
  },
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <SortingOptionsIes />
    </div>
  ),
}
