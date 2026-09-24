import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IesSearchHeader } from './ies-search-header'

const meta = {
  title: 'Organisms/IesSearchHeader',
  component: IesSearchHeader,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/ies',
        query: {},
      },
    },
  },
} satisfies Meta<typeof IesSearchHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="max-w-xl p-4 bg-white">
      <IesSearchHeader module="4" />
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
      <IesSearchHeader module="4" />
    </div>
  ),
}
