import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import SeloEnade from '@/components/features/selo-enade/selo-enade'
import { Card } from './index'

const meta = {
  component: Card,
  title: 'components/Card',
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '',
    v: 'prev',
  },
  render: (args) => (
    <Card {...args}>
      <Card.Header title="Algum título" subtitle="algum subtítulo">
        <SeloEnade faixa={4} />
      </Card.Header>
      <Card.Tags source={['Gratuito', 'FUVEST']} className="ml-11" />
      <Card.ProgressBar title="Teste" percentage={'50%'} />
    </Card>
  ),
}
