import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import BotaoComoInterpretar from './botao-como-interpretar'

const meta = {
  component: BotaoComoInterpretar,
  args: {
    cor: 'var(--color-m2-accent)',
    corTexto: 'var(--color-m2-deep)',
    onClick: () => {},
  },
} satisfies Meta<typeof BotaoComoInterpretar>

export default meta
type Story = StoryObj<typeof meta>

export const Module2: Story = {}

export const Module1: Story = {
  args: {
    cor: 'var(--color-m1-accent)',
    corTexto: 'var(--color-m1-deep)',
  },
}

export const Module5: Story = {
  args: {
    cor: 'var(--color-m5-accent)',
    corTexto: 'var(--color-m5-deep)',
  },
}
