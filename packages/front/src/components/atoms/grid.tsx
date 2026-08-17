import type { ReactNode } from 'react'

interface GridProps {
  children: ReactNode
  className?: string
}

const Grid = ({ children, className = '' }: GridProps) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 p-4 ${className}`}
    >
      {children}
    </div>
  )
}

export default Grid
