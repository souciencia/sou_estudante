import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './search-pagination'

const links = {
  self: '/cursos?page=1',
  first: '/cursos?page=1',
  next: '/cursos?page=2',
  last: '/cursos?page=3',
}

describe('Pagination', () => {
  it('navigates when a page button is pressed', () => {
    const onNavigate = vi.fn()
    render(
      <Pagination
        links={links}
        currentPage={1}
        total={50}
        limit={20}
        onNavigate={onNavigate}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }))

    expect(onNavigate).toHaveBeenCalledWith('/cursos?page=2')
  })

  it('exposes the module theme through data-module', () => {
    render(
      <Pagination
        links={links}
        currentPage={1}
        total={50}
        limit={20}
        onNavigate={() => {}}
        module="4"
      />,
    )

    expect(screen.getByRole('navigation')).toHaveAttribute('data-module', '4')
  })
})
