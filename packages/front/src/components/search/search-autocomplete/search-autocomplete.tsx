import { Search } from 'lucide-react'
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import type { Module } from '@/lib/module'
import { API_CONFIG } from '@/services/api'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { cn } from '@/utils/cn'

export interface SearchAutocompleteProps {
  defaultValue?: string
  onSearchSubmit: (value: string) => void
  debounceMs?: number
  module?: Module
  className?: string
  /** Hook de sugestões (default: cursos). Permite reuso por outros domínios. */
  useSuggestions?: (termo: string) => {
    sugestoes: string[]
    isLoading: boolean
  }
  placeholder?: string
  searchLabel?: string
  listLabel?: string
  minChars?: number
}

export function SearchAutocomplete({
  defaultValue = '',
  onSearchSubmit,
  debounceMs = API_CONFIG.SEARCH_DEBOUNCE_MS,
  module,
  className,
  useSuggestions = useSugestoesCursos,
  placeholder = 'Busque pelo nome do curso',
  searchLabel = 'Buscar curso pelo nome',
  listLabel = 'Sugestões de cursos',
  minChars = API_CONFIG.SUGGEST_MIN_CHARS,
}: SearchAutocompleteProps) {
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [value, setValue] = useState(defaultValue)
  const [termo, setTermo] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { sugestoes } = useSuggestions(termo)

  const hasTermo = termo.trim().length >= minChars
  const isOpen = open && focused && hasTermo && sugestoes.length > 0

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // Abre/fecha o menu conforme foco, termo e sugestões disponíveis
  useEffect(() => {
    if (!focused || !hasTermo || sugestoes.length === 0) {
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    setOpen(true)
  }, [focused, hasTermo, sugestoes])

  const selectOption = (option: string) => {
    setValue(option)
    setOpen(false)
    setActiveIndex(-1)
    onSearchSubmit(option)
  }

  const submitCurrentValue = () => {
    const submitted = value.trim()
    if (submitted === '') return
    setOpen(false)
    setActiveIndex(-1)
    onSearchSubmit(submitted)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setValue(nextValue)
    setActiveIndex(-1)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    if (debounceMs <= 0) {
      setTermo(nextValue.trim())
      return
    }

    timerRef.current = setTimeout(() => {
      setTermo(nextValue.trim())
    }, debounceMs)
  }

  const handleFocus = (_e: FocusEvent<HTMLInputElement>) => {
    setFocused(true)
  }

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setFocused(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && sugestoes.length > 0 && hasTermo) {
        e.preventDefault()
        setOpen(true)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        submitCurrentValue()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((current) => (current + 1) % sugestoes.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((current) =>
          current <= 0 ? sugestoes.length - 1 : current - 1,
        )
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && sugestoes[activeIndex]) {
          selectOption(sugestoes[activeIndex])
        } else {
          submitCurrentValue()
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
      default:
        break
    }
  }

  const handleOptionMouseDown = (
    e: MouseEvent<HTMLDivElement>,
    option: string,
  ) => {
    // Impede o blur antes da seleção para manter o foco no input
    e.preventDefault()
    selectOption(option)
  }

  return (
    <div data-module={module} className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        {searchLabel}
      </label>

      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      />

      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          isOpen && activeIndex >= 0
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        autoComplete="off"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4',
          'font-protagonist text-protagonist text-fg-protagonist placeholder:text-fg-muted',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          'transition-colors duration-200',
        )}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={listLabel}
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {sugestoes.map((sugestao, index) => (
            <div
              key={sugestao}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              tabIndex={-1}
              onMouseDown={(e) => handleOptionMouseDown(e, sugestao)}
              className={cn(
                'cursor-pointer px-4 py-2 font-coadjuvant text-coadjuvant text-fg-coadjuvant',
                'hover:bg-accent/10',
                activeIndex === index && 'bg-accent/10 text-accent-deep',
              )}
            >
              {sugestao}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
