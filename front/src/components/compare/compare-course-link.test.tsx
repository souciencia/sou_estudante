import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CompareCourseLink } from './compare-course-link'
import { CompareProvider } from './compare-provider'

function renderLink(courseId: number) {
  return render(
    <CompareProvider>
      <CompareCourseLink courseId={courseId} />
    </CompareProvider>,
  )
}

describe('CompareCourseLink', () => {
  it('mostra "Comparar" quando o curso não está na comparação', () => {
    renderLink(101)

    expect(screen.getByRole('button', { name: 'Comparar' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('alterna para "Adicionado à comparação" ao clicar', () => {
    renderLink(101)

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))

    expect(
      screen.getByRole('button', { name: 'Adicionado à comparação' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('remove o curso da comparação ao clicar novamente', () => {
    renderLink(101)

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionado à comparação' }),
    )

    expect(screen.getByRole('button', { name: 'Comparar' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
