import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BackLink } from './back-link'

const meta = {
  title: 'Components/Ui/BackLink',
  component: BackLink,
  tags: ['autodocs'],
} satisfies Meta<typeof BackLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Resultados',
    fallbackHref: '/cursos',
  },
}
