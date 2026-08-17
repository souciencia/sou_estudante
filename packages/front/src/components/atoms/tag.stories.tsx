import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tag } from './tag'

const meta = {
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
    label: 'Botão teste',
    module: '2',
  },
}
