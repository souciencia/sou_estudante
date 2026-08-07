import { Button } from './button'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta = {
  component: Button,
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Botão teste',
    module: '1',
  },
}

export const Module2: Story = {
  args: {
    children: 'Botão teste',
    module: '2',
  },
}
