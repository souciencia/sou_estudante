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
import type { Sugestao } from '@/services/api/types'
import { cn } from '@/utils/cn'

export interface SearchAutocompleteProps {
  defaultValue?: string
  onSearchSubmit: (value: string) => void
  debounceMs?: number
  module?: Module
  className?: string
  /** Hook de sugestões do domínio (o agnóstico não conhece nenhum). */
  useSuggestions: (termo: string) => {
    sugestoes: Sugestao[]
    isLoading: boolean
  }
  placeholder: string
  /** Rótulo acessível do campo de busca. */
  searchLabel: string
  /** Rótulo acessível da lista de sugestões. */
  listLabel: string
  minChars?: number
  /** Quando informado, exibe um botão de envio com este rótulo. */
  submitLabel?: string
}

export function SearchAutocomplete({
  defaultValue = '',
  onSearchSubmit,
  debounceMs = API_CONFIG.SEARCH_DEBOUNCE_MS,
  module,
  className,
  useSuggestions,
  placeholder,
  searchLabel,
  listLabel,
  minChars = API_CONFIG.SUGGEST_MIN_CHARS,
  submitLabel,
}: SearchAutocompleteProps) {
  const inputId = useId()
  const listboxId = `${inputId}-listbox`
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [value, setValue] = useState(defaultValue)
  const [termo, setTermo] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const { sugestoes, isLoading } = useSuggestions(termo)

  const hasTermo = termo.trim().length >= minChars
  // Estado derivado calculado na renderização: `open` guarda a intenção do
  // usuário (foco/digitação/Escape) e as demais condições vêm das props atuais.
  const isOpen = open && hasTermo && sugestoes.length > 0

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const selectOption = (option: Sugestao) => {
    setValue(option.nome)
    setOpen(false)
    setActiveIndex(-1)
    onSearchSubmit(option.nome)
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
    setOpen(true)
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
    setOpen(true)
  }

  const handleBlur = (_e: FocusEvent<HTMLInputElement>) => {
    setOpen(false)
    setActiveIndex(-1)
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
    option: Sugestao,
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
          'w-full rounded-full border border-accent-deep/20 bg-surface-lv2 py-3.5 pl-11',
          submitLabel ? 'pr-28' : 'pr-4',
          'font-sans text-base text-fg placeholder:text-fg-muted',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-deep',
          'transition-colors duration-200',
        )}
      />

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading && hasTermo
          ? 'Carregando sugestões'
          : isOpen
            ? `${sugestoes.length} sugestões disponíveis`
            : ''}
      </div>

      {submitLabel && (
        <button
          type="button"
          onClick={submitCurrentValue}
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-navy-900 px-5 py-2.5',
            'font-sans text-xs font-semibold text-on-dark',
            'transition-colors duration-200 hover:bg-navy-950',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
          )}
        >
          {submitLabel}
        </button>
      )}

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={listLabel}
          className="scrollbar-visible absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-border-primary bg-surface-lv2 py-1 shadow-lg"
        >
          {sugestoes.map((sugestao, index) => (
            <div
              key={sugestao.nome}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              tabIndex={-1}
              onMouseDown={(e) => handleOptionMouseDown(e, sugestao)}
              className={cn(
                'flex cursor-pointer items-center justify-between gap-3 px-4 py-2 font-sans text-sm text-fg',
                'hover:bg-accent/10',
                activeIndex === index && 'bg-accent/10 text-accent-deep',
              )}
            >
              <span>{sugestao.nome}</span>
              {sugestao.count > 0 && (
                <span className="shrink-0 rounded-full bg-surface-deep/30 px-2 py-0.5 font-sans text-xs text-fg-muted">
                  {sugestao.count} {sugestao.count === 1 ? 'curso' : 'cursos'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
