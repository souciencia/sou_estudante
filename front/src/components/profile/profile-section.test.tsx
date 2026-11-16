import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileSection } from './profile-section'

describe('ProfileSection', () => {
  it('shows the title as a level-2 heading above the content', () => {
    render(
      <ProfileSection title="Continue sua rota">
        <p>conteúdo da seção</p>
      </ProfileSection>,
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Continue sua rota' }),
    ).toBeInTheDocument()
    expect(screen.getByText('conteúdo da seção')).toBeInTheDocument()
  })
})
