import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileIES } from './profile-ies'

const meta = {
  title: 'Components/Profile/Wrappers/ProfileIES',
  component: ProfileIES,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileIES>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ies: {
      co_ies: '1',
      no_ies: 'UNIVERSIDADE FEDERAL DE MATO GROSSO',
      sg_ies: 'UFMT',
      categoria_administrativa: 'Pública Federal',
      organizacao_academica: 'Universidade',
      municipio: 'Cuiabá',
      uf: 'MT',
      regiao: 'Centro-Oeste',
    },
  },
}
