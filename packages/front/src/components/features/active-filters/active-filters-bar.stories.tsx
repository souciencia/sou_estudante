import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ActiveFiltersBar } from './active-filters-bar'

const meta = {
  title: 'Molecules/ActiveFiltersBar',
  component: ActiveFiltersBar,
} satisfies Meta<typeof ActiveFiltersBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    filters: [
      { key: 'uf', value: 'SP', label: 'São Paulo' },
      { key: 'uf', value: 'RJ', label: 'Rio de Janeiro' },
      { key: 'regiao', value: 'Sudeste', label: 'Sudeste' },
    ],
    onRemove: () => {},
    onClear: () => {},
    module: '4',
  },
}

export const SingleFilter: Story = {
  args: {
    filters: [{ key: 'uf', value: 'SP', label: 'São Paulo' }],
    onRemove: () => {},
    onClear: () => {},
    module: '4',
  },
}

export const Empty: Story = {
  args: {
    filters: [],
    onRemove: () => {},
    onClear: () => {},
  },
}
