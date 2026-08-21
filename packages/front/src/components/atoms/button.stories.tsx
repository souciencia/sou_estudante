import { Button } from './button'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AttentionIcon from '@/assets/attention-icon'

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
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

export const Module3: Story = {
  args: {
    children: (<>
      <AttentionIcon />
      como interpretar
    </>
    ),
    module: '2'
  },
}
