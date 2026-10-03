import type { Meta, StoryObj } from '@storybook/react';
import { ProfileIngresso } from './profile-ingresso';

const meta: Meta<typeof ProfileIngresso> = {
    title: 'Components/Profile/Wrappers/ProfileIngresso',
    component: ProfileIngresso,
    parameters: {
        layout: 'fullscreen',
    },
};

export default meta;
type Story = StoryObj<typeof ProfileIngresso>;

// Exemplo de curso com 1 único turno
export const TurnoUnico: Story = {
    args: {
        module: '2',
        curso: {
            curso: {
                no_curso: 'Engenharia de Computação',
                no_grau_academico: 'Bacharelado',
                in_gratuito: false,
                cine: undefined
            },
            instituicao: {
                no_ies: 'Universidade de São Paulo',
                sg_ies: 'USP',
            },
            localizacao: {
                no_municipio: 'São Paulo',
                sg_uf: 'SP',
                in_capital: false
            },
            sisu: {
                ofertas: [
                    {
                        municipio: '3550308',
                        nome_municipio: 'SÃO PAULO',
                        turno: 'INTEGRAL',
                        modalidade: 'AC',
                        ordem_modalidade: 1,
                        grupo: 'AC',
                        descricao: 'Ampla concorrência',
                        vagas: 50,
                        nota_corte: 780.50,
                        inscricoes: 500,
                    },
                    {
                        municipio: '3550308',
                        nome_municipio: 'SÃO PAULO',
                        turno: 'INTEGRAL',
                        modalidade: 'LB_EP',
                        ordem_modalidade: 3,
                        grupo: 'LB',
                        descricao: 'Candidatos com renda familiar...',
                        vagas: 10,
                        nota_corte: 690.20,
                        inscricoes: 120,
                    },
                ],
                tem_sisu: false
            },
        },
    },
};

// Exemplo de curso com múltiplos turnos
export const MultiplosTurnos: Story = {
    args: {
        module: '2',
        curso: {
            curso: {
                no_curso: 'Ciência da Computação',
                no_grau_academico: 'Bacharelado',
                in_gratuito: false,
                cine: undefined
            },
            instituicao: {
                no_ies: 'Universidade Federal de Minas Gerais',
                sg_ies: 'UFMG',
            },
            localizacao: {
                no_municipio: 'Belo Horizonte',
                sg_uf: 'MG',
                in_capital: false
            },
            sisu: {
                ofertas: [
                    {
                        municipio: '3106200',
                        nome_municipio: 'BELO HORIZONTE',
                        turno: 'INTEGRAL',
                        modalidade: 'AC',
                        ordem_modalidade: 1,
                        grupo: 'AC',
                        descricao: 'Ampla concorrência',
                        vagas: 40,
                        nota_corte: 790.10,
                        inscricoes: 600,
                    },
                    {
                        municipio: '3106200',
                        nome_municipio: 'BELO HORIZONTE',
                        turno: 'NOTURNO',
                        modalidade: 'AC',
                        ordem_modalidade: 1,
                        grupo: 'AC',
                        descricao: 'Ampla concorrência',
                        vagas: 40,
                        nota_corte: 760.40,
                        inscricoes: 550,
                    },
                ],
                tem_sisu: false
            },
        },
    },
};