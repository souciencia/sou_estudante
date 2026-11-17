import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CompareCourseButton } from './compare-course-button'
import { CompareProvider } from './compare-provider'

function renderButton(courseId: number) {
  return render(
    <CompareProvider>
      <CompareCourseButton courseId={courseId} />
    </CompareProvider>,
  )
}

describe('CompareCourseButton', () => {
  it('mostra "Comparar" quando o curso não está na comparação', () => {
    renderButton(101)

    expect(screen.getByRole('button', { name: /Comparar/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('alterna para "Na comparação" ao clicar', () => {
    renderButton(101)

    fireEvent.click(screen.getByRole('button', { name: /Comparar/ }))

    expect(
      screen.getByRole('button', { name: /Na comparação/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('remove o curso da comparação ao clicar novamente', () => {
    renderButton(101)

    const button = screen.getByRole('button', { name: /Comparar/ })
    fireEvent.click(button)
    fireEvent.click(screen.getByRole('button', { name: /Na comparação/ }))

    expect(screen.getByRole('button', { name: /Comparar/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
