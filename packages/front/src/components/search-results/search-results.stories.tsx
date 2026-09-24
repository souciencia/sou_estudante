import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Card } from '@/components/card'
import { SearchResults } from './search-results'

interface DemoItem {
  id: string
  nome: string
}

const items: DemoItem[] = [
  { id: '1', nome: 'Ciência da Computação' },
  { id: '2', nome: 'Engenharia Civil' },
]

type DemoVariant = 'default' | 'loading' | 'empty' | 'error'

function SearchResultsDemo({ variant = 'default' }: { variant?: DemoVariant }) {
  if (variant === 'loading') {
    return (
      <SearchResults<DemoItem>
        items={[]}
        isLoading
        labels={{ singular: 'resultado', plural: 'resultados' }}
        getItemKey={(item) => item.id}
        renderItem={(item) => <Card.Header title={item.nome} />}
      />
    )
  }

  if (variant === 'empty') {
    return (
      <SearchResults<DemoItem>
        items={[]}
        total={0}
        labels={{ singular: 'resultado', plural: 'resultados' }}
        emptyMessage="Nenhum resultado por aqui"
        getItemKey={(item) => item.id}
        renderItem={(item) => <Card.Header title={item.nome} />}
      />
    )
  }

  if (variant === 'error') {
    return (
      <SearchResults<DemoItem>
        items={[]}
        error="Erro ao buscar resultados"
        labels={{ singular: 'resultado', plural: 'resultados' }}
        getItemKey={(item) => item.id}
        renderItem={(item) => <Card.Header title={item.nome} />}
      />
    )
  }

  return (
    <SearchResults<DemoItem>
      items={items}
      total={items.length}
      labels={{ singular: 'resultado', plural: 'resultados' }}
      getItemKey={(item) => item.id}
      renderItem={(item) => (
        <Card module="1">
          <Card.Header title={item.nome} />
        </Card>
      )}
    />
  )
}

const meta = {
  title: 'Molecules/SearchResults',
  component: SearchResultsDemo,
} satisfies Meta<typeof SearchResultsDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = { args: { variant: 'loading' } }
export const Empty: Story = { args: { variant: 'empty' } }
export const ErrorState: Story = { args: { variant: 'error' } }
