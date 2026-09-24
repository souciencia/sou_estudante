import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Switch } from './switch'

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  tags: ['autodocs'],
  args: {
    checked: false,
    'aria-label': 'Busca exata',
    onCheckedChange: () => {},
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Desligado: Story = {}

export const Ligado: Story = {
  args: {
    checked: true,
  },
}

export const Desabilitado: Story = {
  args: {
    disabled: true,
    checked: true,
  },
}
