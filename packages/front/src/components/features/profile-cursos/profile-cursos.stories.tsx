import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Curso } from '@/services/api/types'
import { ProfileCursos } from './profile-cursos'

const meta = {
  title: 'Components/ProfileCursos',
  component: ProfileCursos,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileCursos>

export default meta
type Story = StoryObj<typeof meta>

const curso: Curso = {
  sequencial: 1,
  curso: {
    no_curso: 'MEDICINA',
    no_grau_academico: 'BACHARELADO',
    no_modalidade_ensino: 'PRESENCIAL',
    in_gratuito: false,
    cine: {},
  },
  instituicao: {
    co_ies: '1',
    sg_ies: 'UNI-BH',
    categoria_administrativa: 'Privada com fins lucrativos',
  },
  localizacao: {
    no_municipio: 'BELO HORIZONTE',
    sg_uf: 'MG',
    in_capital: true,
  },
  censo_metricas: { qt_vg_total: 252, qt_vg_total_diurno: 252 },
  enade: {
    ano_enade: 2023,
    conceito_continuo_enade: 4.788,
    conceito_faixa_enade: '2',
  },
  tda: { tda: 25.6, nu_ano_ingresso_tda: 2020, nu_ano_referencia_tda: 2024 },
  sisu: { tem_sisu: false, ofertas: [] },
}

export const Default: Story = {
  args: {
    module: '1',
    curso,
  },
}
