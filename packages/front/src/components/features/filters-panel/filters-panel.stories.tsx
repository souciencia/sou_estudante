import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { type FilterSectionDefinition, FiltersPanel } from './filters-panel'

const sections: FilterSectionDefinition[] = [
  {
    key: 'uf',
    title: 'Estado',
    aggregationKey: 'ufs',
    visibleCount: 3,
    moreLabel: (hidden) => `+ ${hidden} estados`,
    lessLabel: 'Ver menos estados',
    options: [
      { label: 'São Paulo', value: 'SP' },
      { label: 'Bahia', value: 'BA' },
      { label: 'Rio de Janeiro', value: 'RJ' },
      { label: 'Minas Gerais', value: 'MG' },
      { label: 'Paraná', value: 'PR' },
    ],
  },
  {
    key: 'regiao',
    title: 'Região',
    aggregationKey: 'regioes',
    options: [
      { label: 'Sudeste', value: 'Sudeste' },
      { label: 'Nordeste', value: 'Nordeste' },
      { label: 'Sul', value: 'Sul' },
    ],
  },
]

const meta = {
  title: 'Molecules/FiltersPanel',
  component: FiltersPanel,
} satisfies Meta<typeof FiltersPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sections,
    aggregations: {
      ufs: [
        { key: 'SP', count: 323 },
        { key: 'RJ', count: 140 },
        { key: 'MG', count: 98 },
      ],
      regioes: [{ key: 'Sudeste', count: 561 }],
    },
    activeValues: () => ['SP'],
    onToggle: () => {},
    module: '4',
  },
}

export const WithSelection: Story = {
  args: {
    ...Default.args,
    activeValues: () => ['SP', 'RJ'],
  },
}
