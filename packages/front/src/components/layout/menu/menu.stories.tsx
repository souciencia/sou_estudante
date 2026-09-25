import type { Meta, StoryObj } from '@storybook/react'
import Menu from './menu'

const meta = {
  title: 'Components/Layout/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Menu>

export default meta

type Story = StoryObj<typeof meta>

export const Light: Story = {
  args: {
    mode: 'light',
  },
}

export const Dark: Story = {
  args: {
    mode: 'dark',
  },
  decorators: [ 
    (Story) => ( 
      <div className="bg-navy-900 p-8">
        <Story />
      </div> 
    ), 
  ],
}