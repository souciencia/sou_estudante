import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Curso } from '@/services/api/types'
import { ProfileCursosQuality } from './profile-cursos-quality'

const meta = {
  title: 'Components/Profile/Wrappers/ProfileCursos/Quality',
  component: ProfileCursosQuality,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileCursosQuality>

export default meta
type Story = StoryObj<typeof meta>

const curso: Curso = {
  curso: { no_curso: 'MEDICINA', in_gratuito: false, cine: {} },
  instituicao: {},
  localizacao: { in_capital: true },
  censo_metricas: {},
  enade: {
    ano_enade: 2023,
    conceito_continuo_enade: 4.788,
    conceito_faixa_enade: '2',
  },
  tda: { nu_ano_ingresso_tda: 2020, nu_ano_referencia_tda: 2024, tda: 25.6 },
  sisu: { tem_sisu: false, ofertas: [] },
}

export const Default: Story = {
  args: {
    module: '1',
    curso,
  },
}
