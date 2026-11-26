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
  it('mostra "Adicionar à comparação" quando o curso não está na comparação', () => {
    renderButton(101)

    expect(
      screen.getByRole('button', { name: /Adicionar à comparação/ }),
    ).toBeInTheDocument()
  })

  it('alterna para o link "Ir para a Comparação" ao clicar', () => {
    renderButton(101)

    fireEvent.click(
      screen.getByRole('button', { name: /Adicionar à comparação/ }),
    )

    expect(
      screen.getByRole('link', { name: /Ir para a Comparação/ }),
    ).toHaveAttribute('href', '/comparar')
  })
})
