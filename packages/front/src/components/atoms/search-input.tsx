'use client'

import { Search } from 'lucide-react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  onSearchChange?: (value: string) => void
}

export function SearchInput({
  onSearchChange,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="text"
        className={cn(
          'w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4',
          'text-base text-gray-900 placeholder:text-gray-500',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'transition-colors duration-200',
          className,
        )}
        onChange={(e) => onSearchChange?.(e.target.value)}
        {...props}
      />
    </div>
  )
}
