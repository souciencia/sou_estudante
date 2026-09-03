import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import AttentionIcon from '@/assets/attention-icon'
<<<<<<< HEAD
import { Button } from './button'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  tags: ['autodocs'],
=======

const meta = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
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
<<<<<<< HEAD
    children: (
      <>
        <AttentionIcon />
        como interpretar
      </>
    ),
    module: '2',
=======
    children: (<>
      <AttentionIcon />
      como interpretar
    </>
    ),
    module: '2'
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
  },
}
