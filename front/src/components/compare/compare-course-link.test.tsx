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
  it('mostra "Incluir na comparação" quando o curso não está na comparação', () => {
    renderLink(101)

    const toggle = screen.getByRole('switch', {
      name: 'Incluir na comparação',
    })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('alterna para "Incluído na comparação" ao ativar', () => {
    renderLink(101)

    fireEvent.click(
      screen.getByRole('switch', { name: 'Incluir na comparação' }),
    )

    expect(
      screen.getByRole('switch', { name: 'Incluído na comparação' }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('remove o curso da comparação ao desativar', () => {
    renderLink(101)

    fireEvent.click(
      screen.getByRole('switch', { name: 'Incluir na comparação' }),
    )
    fireEvent.click(
      screen.getByRole('switch', { name: 'Incluído na comparação' }),
    )

    expect(
      screen.getByRole('switch', { name: 'Incluir na comparação' }),
    ).toHaveAttribute('aria-checked', 'false')
  })
})
