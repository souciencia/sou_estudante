import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MapPin } from 'lucide-react'
import { IconTile } from './icon-tile'

const meta = {
  title: 'Atoms/IconTile',
  component: IconTile,
  tags: ['autodocs'],
} satisfies Meta<typeof IconTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    module: '2',
    children: <MapPin className="size-6" />,
  },
}
