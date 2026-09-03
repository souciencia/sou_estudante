import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import SeloEnade from '@/components/molecules/selo-enade'
import { Card } from './index'
import SeloEnade from '@/components/molecules/selo-enade'

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
<<<<<<< HEAD
        <SeloEnade faixa={4} />
=======
        <SeloEnade faixa={4}/>
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
      </Card.Header>
      <Card.Tags source={['Gratuito', 'FUVEST']} className="ml-11" />
      <Card.ProgressBar title="Teste" percentage={'50%'} />
    </Card>
  ),
}
