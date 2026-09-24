import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Header } from './header'

const meta = {
  title: 'Components/Layout/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const OnHome: Story = {}

export const OnCursos: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/cursos',
      },
    },
  },
}

export const OnIes: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/ies',
      },
    },
  },
}
