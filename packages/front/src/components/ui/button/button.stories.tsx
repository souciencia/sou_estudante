import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AttentionIcon from '@/assets/attention-icon'
import { Button } from './button'

const meta = {
  title: 'Components/Ui/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Botão teste',
    module: '1',
  },
}

export const Active: Story = {
  args: {
    children: 'Botão teste',
    module: '1',
    active: true,
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
    children: (
      <>
        <AttentionIcon />
        como interpretar
      </>
    ),
    module: '3',
  },
}

export const Module4: Story = {
  args: {
    children: 'Botão teste',
    module: '4',
  },
}

export const Module5: Story = {
  args: {
    children: 'Botão teste',
    module: '5',
  },
}

export const Solid: Story = {
  args: {
    children: 'Escolher curso',
    module: '1',
    v: 'solid',
  },
}

export const Outline: Story = {
  args: {
    children: 'Como interpretar?',
    module: '1',
    v: 'outline',
  },
}

export const OutlineCompare: Story = {
  args: {
    children: 'Comparar com outros cursos',
    module: '5',
    v: 'outline',
  },
}
