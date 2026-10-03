import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Star } from 'lucide-react'
import { Callout } from './index'

const meta = {
  title: 'Components/Ui/Callout',
  component: Callout,
  tags: ['autodocs'],
  argTypes: {
    v: {
      control: 'inline-radio',
      options: ['info', 'future'],
    },
  },
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

export const Full: Story = {
  args: {
    v: 'info',
  },
  render: (args) => (
    <Callout {...args}>
      <Callout.Header>
        <Callout.Icon>
          <Star className="h-5 w-5 fill-current" aria-hidden="true" />
        </Callout.Icon>
        <Callout.HeaderContent>
          <Callout.Tagline>Para você, estudante</Callout.Tagline>
          <Callout.Title>A nota de corte é um ponto de partida</Callout.Title>
        </Callout.HeaderContent>
      </Callout.Header>
      <Callout.Content>
        O Sistema de Seleção Unificada (Sisu) é a plataforma do MEC que usa a
        nota do Enem para distribuir vagas em universidades públicas. Você se
        inscreve, escolhe cursos e concorre pela sua nota — sem prestar um
        vestibular próprio.
      </Callout.Content>
      <Callout.Footer>
        — SoU_Estudante · SoU_Ciência / Unifesp · Sisu
      </Callout.Footer>
    </Callout>
  ),
}

export const FullFuture: Story = {
  args: {
    v: 'future',
  },
  render: (args) => (
    <Callout {...args}>
      <Callout.Header>
        <Callout.Icon>
          <Star className="h-5 w-5 fill-current" aria-hidden="true" />
        </Callout.Icon>
        <Callout.HeaderContent>
          <Callout.Tagline>Em breve</Callout.Tagline>
          <Callout.Title>Progressão das notas</Callout.Title>
        </Callout.HeaderContent>
      </Callout.Header>
      <Callout.Content>
        Em versões futuras: a progressão das notas ao longo dos ciclos, para ler
        tendências de avaliação.
      </Callout.Content>
    </Callout>
  ),
}
