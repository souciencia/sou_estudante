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
import { API_CONFIG } from '@/services/api'
import { useSugestoesCursos } from '@/services/api/use-sugestoes-cursos'
import { cn } from '@/utils/cn'

export interface SearchAutocompleteProps {
  defaultValue?: string
  onSearchSubmit: (value: string) => void
  debounceMs?: number
  className?: string
}

const MIN_CHARS = API_CONFIG.SUGGEST_MIN_CHARS

export function SearchAutocomplete({
  defaultValue = '',
  onSearchSubmit,
  debounceMs = API_CONFIG.SEARCH_DEBOUNCE_MS,
  className,
}: SearchAutocompleteProps) {
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [value, setValue] = useState(defaultValue)
  const [termo, setTermo] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { sugestoes } = useSugestoesCursos(termo)

  const hasTermo = termo.trim().length >= MIN_CHARS
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
    <div className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        Buscar curso pelo nome
      </label>

      <Search
        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
        placeholder="Busque pelo nome do curso"
        className={cn(
          'w-full rounded-full border border-gray-300 bg-white py-3 pl-11 pr-4',
          'text-base text-gray-900 placeholder:text-gray-500',
          'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
          'transition-colors duration-200',
        )}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Sugestões de cursos"
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
                'cursor-pointer px-4 py-2 text-sm text-gray-800',
                'hover:bg-plum-100',
                activeIndex === index && 'bg-plum-100 text-plum-800',
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
