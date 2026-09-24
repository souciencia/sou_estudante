import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CardField } from './card-fields'
import { Card } from './index'

const items: CardField[] = [
  { label: 'Localização', value: 'São Paulo - SP' },
  { label: 'Região', value: undefined },
]

describe('Card.Fields', () => {
  it('renderiza os campos com valor e omite os vazios', () => {
    render(
      <Card module="4">
        <Card.Fields items={items} />
      </Card>,
    )

    expect(screen.getByText('Localização:')).toBeInTheDocument()
    expect(screen.getByText('São Paulo - SP')).toBeInTheDocument()
    expect(screen.queryByText('Região:')).not.toBeInTheDocument()
  })
})
