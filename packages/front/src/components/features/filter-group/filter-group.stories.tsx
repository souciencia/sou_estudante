import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FilterGroup } from './index'

const meta = {
  component: FilterGroup,
  title: 'components/FilterGroup',
} satisfies Meta<typeof FilterGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '',
  },
  render: (args) => (
    <FilterGroup {...args}>
      <FilterGroup.Title>Categoria</FilterGroup.Title>
      <FilterGroup.List>
        <FilterGroup.Option label="Federal" resultCount={7} />
        <FilterGroup.Option label="Estadual" resultCount={4} />
        <FilterGroup.Option label="Municipal" resultCount={1} defaultChecked />
        <FilterGroup.Option label="Privada" resultCount={4} disabled />
      </FilterGroup.List>
    </FilterGroup>
  ),
}
