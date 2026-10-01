import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WavesShape } from './waves'

const meta = {
  title: 'Components/Shapes/WavesShape',
  component: WavesShape,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WavesShape>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
