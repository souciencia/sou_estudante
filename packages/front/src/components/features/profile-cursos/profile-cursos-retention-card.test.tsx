import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProfileCursosRetentionCard } from './profile-cursos-retention-card'

describe('ProfileCursosRetentionCard', () => {
  it('shows the course rate and the national average', () => {
    render(
      <ProfileCursosRetentionCard
        taxa={25.6}
        mediaBrasil={54.8}
        anoInicio={2020}
        anoFim={2024}
      />,
    )

    expect(screen.getAllByText('25,6%').length).toBeGreaterThan(0)
    expect(screen.getByText('54,8%')).toBeInTheDocument()
  })

  it('describes the cohort being followed', () => {
    render(
      <ProfileCursosRetentionCard taxa={25.6} anoInicio={2020} anoFim={2024} />,
    )

    expect(
      screen.getByText(/ingressantes de 2020 acompanhados até 2024/),
    ).toBeInTheDocument()
  })

  it('omits the national average when it is unknown', () => {
    render(<ProfileCursosRetentionCard taxa={25.6} />)

    expect(screen.queryByText(/Média Brasil/)).not.toBeInTheDocument()
  })
})
