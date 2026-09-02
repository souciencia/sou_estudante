// components/atoms/search-input.tsx
'use client'

import { Search } from 'lucide-react'
import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/utils/cn'

export type SearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  onSearchChange?: (value: string) => void
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  debounceMs?: number
}

export function SearchInput({
  onSearchChange,
  onChange,
  onKeyDown,
  defaultValue = '',
  value,
  debounceMs = 300,
  className,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState<string>(() => {
    if (value !== undefined) return String(value)
    return String(defaultValue)
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const latestValueRef = useRef(internalValue)
  latestValueRef.current = internalValue

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(String(value))
    }
  }, [value])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setInternalValue(nextValue)
    onChange?.(e)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (debounceMs <= 0) {
      onSearchChange?.(nextValue)
      return
    }

    timerRef.current = setTimeout(() => {
      onSearchChange?.(nextValue)
    }, debounceMs)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      onSearchChange?.(latestValueRef.current)
    }
    onKeyDown?.(e)
  }

  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4',
          'text-base text-gray-900 placeholder:text-gray-500',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'transition-colors duration-200',
          className,
        )}
        {...props}
      />
    </div>
  )
}
