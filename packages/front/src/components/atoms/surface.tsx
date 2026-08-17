import type { HTMLAttributes, ReactNode } from 'react'

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

export const Surface = ({
  children,
  className = '',
  ...props
}: SurfaceProps) => {
  return (
    <div
      {...props}
      className={`bg-surface p-6 rounded-2xl shadow-lg ${className}`}
    >
      {children}
    </div>
  )
}
