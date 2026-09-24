import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import IesResultItem from './ies-result-item'

const meta = {
  title: 'Components/Ies/IesResultItem',
  component: IesResultItem,
} satisfies Meta<typeof IesResultItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    module: '4',
    ies: {
      co_ies: '376',
      no_ies: 'UNIVERSIDADE FEDERAL DO MATO GROSSO',
      sg_ies: 'UFMT',
      categoria_administrativa: 'Pública Federal',
      organizacao_academica: 'Universidade',
      municipio: 'Cuiabá',
      uf: 'MT',
      regiao: 'Centro-Oeste',
    },
  },
}

export const SemSigla: Story = {
  args: {
    module: '4',
    ies: {
      co_ies: '1',
      no_ies: 'FACULDADE DE TECNOLOGIA XPTO',
      categoria_administrativa: 'Privada com fins lucrativos',
      organizacao_academica: 'Faculdade',
      municipio: 'São Paulo',
      uf: 'SP',
      regiao: 'Sudeste',
    },
  },
}
