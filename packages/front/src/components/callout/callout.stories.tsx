import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Callout } from './callout'

const meta = {
  title: 'Atoms/Callout',
  component: Callout,
  tags: ['autodocs'],
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    v: 'info',
    children:
      'O conceito Enade é avaliado por ciclos — nem todos os cursos são avaliados no mesmo ano.',
  },
}

export const Future: Story = {
  args: {
    v: 'future',
    children:
      'Em versões futuras: a progressão das notas ao longo dos ciclos, para ler tendências de avaliação.',
  },
}
