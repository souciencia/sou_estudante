import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Route } from './route'

const meta = {
  title: 'Components/Route',
  component: Route,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Route>

export default meta

type Story = StoryObj<typeof meta>

export const Module1: Story = {
  args: {
    module: '1',
  },
}

export const Module2: Story = {
  args: {
    module: '2',
  },
}

export const Module3: Story = {
  args: {
    module: '3',
  },
}

export const Module4: Story = {
  args: {
    module: '4',
  },
}

export const Module5: Story = {
  args: {
    module: '5',
  },
}
