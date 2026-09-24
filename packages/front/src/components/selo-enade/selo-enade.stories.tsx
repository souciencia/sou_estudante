import type { Meta, StoryObj } from '@storybook/react'
import SeloEnade from './selo-enade'

const meta = {
  title: 'Atoms/SeloEnade',
  component: SeloEnade,
  tags: ['autodocs'],
  args: {
    faixa: 5,
    animado: false,
    tamanho: 'card',
  },
} satisfies Meta<typeof SeloEnade>

export default meta

type Story = StoryObj<typeof meta>

export const Faixa5: Story = {
  args: { faixa: 5 },
}

export const Faixa4: Story = {
  args: { faixa: 4 },
}

export const Faixa3: Story = {
  args: { faixa: 3 },
}

export const Faixa2: Story = {
  args: { faixa: 2 },
}

export const Faixa1: Story = {
  args: { faixa: 1 },
}

export const SemConceito: Story = {
  args: { faixa: 'SC' },
}

export const SemAvaliacaoNoCiclo: Story = {
  args: { faixa: null },
}

export const DetalheFaixa5: Story = {
  args: { faixa: 5, tamanho: 'detalhe' },
}

export const DetalheFaixa2: Story = {
  args: { faixa: 2, tamanho: 'detalhe' },
}

export const DetalheAnimado: Story = {
  args: { faixa: 4, tamanho: 'detalhe', animado: true },
}

export const DetalheNeblina: Story = {
  args: { faixa: null, tamanho: 'detalhe' },
}
