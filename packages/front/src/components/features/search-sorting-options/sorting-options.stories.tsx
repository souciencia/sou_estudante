import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SortingOptions, type SortOption } from './sorting-options'

const IES_OPTIONS: SortOption[] = [
  { label: 'A Z', value: 'az' },
  { label: 'Relevância', value: 'relevancia' },
]

const CURSOS_OPTIONS: SortOption[] = [
  { label: 'Maior Enade', value: 'enade' },
  { label: 'Menor desistência', value: 'desistencia' },
  { label: 'A Z', value: 'az' },
]

const meta = {
  title: 'Molecules/SortingOptions',
  component: SortingOptions,
} satisfies Meta<typeof SortingOptions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    options: IES_OPTIONS,
    onSelect: () => {},
    module: '4',
  },
}

export const Cursos: Story = {
  args: {
    options: CURSOS_OPTIONS,
    onSelect: () => {},
    module: '1',
  },
}
