import type { Meta, StoryObj } from '@storybook/react'
import { RoutesBar } from './routes-bar'

const meta = {
  title: 'Components/Layout/RoutesBar',
  component: RoutesBar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RoutesBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    module: '1',
  },
}
