import type { SelectHTMLAttributes } from 'react'

export interface Option {
  value: string
  label: string
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
}

export const Select = ({ options, className = '', ...props }: Props) => {
  return (
    <select
      className={`bg-white border border-gray-300 rounded-md p-2 ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
