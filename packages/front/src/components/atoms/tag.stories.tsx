import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tag } from './tag'

const meta = {
  title: 'Atoms/Tag',
  component: Tag,
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    label: 'uma tag',
    module: '1',
  },
}

export const Module2: Story = {
  args: {
    label: 'uma tag',
    module: '2',
  },
}

export const Module3: Story = {
  args: {
    label: 'uma tag',
    module: '3',
  },
}

export const Module4: Story = {
  args: {
    label: 'uma tag',
    module: '4',
  },
}

export const Module5: Story = {
  args: {
    label: 'uma tag',
    module: '5',
  },
}
