import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SearchHeader } from './index'

const meta = {
  title: 'Components/Search/SearchHeader',
  component: SearchHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof SearchHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    module: '1',
    children: (
      <>
        <SearchHeader.Autocomplete onSearchSubmit={() => {}} />
        <SearchHeader.Actions>
          <span className="font-coadjuvant text-coadjuvant">
            Controles extras
          </span>
        </SearchHeader.Actions>
        <SearchHeader.Sorting>
          <span className="font-coadjuvant text-coadjuvant">Ordenação</span>
        </SearchHeader.Sorting>
      </>
    ),
  },
}
