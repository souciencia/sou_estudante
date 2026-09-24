import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchAutocomplete } from './search-autocomplete'

const meta = {
  title: 'Components/Search/SearchAutocomplete',
  component: SearchAutocomplete,
  tags: ['autodocs'],
  args: {
    defaultValue: '',
    onSearchSubmit: () => {},
  },
} satisfies Meta<typeof SearchAutocomplete>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ComTermoInicial: Story = {
  args: {
    defaultValue: 'medicina',
  },
}
