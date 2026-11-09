'use client'

import { ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox/checkbox'
import type { Module } from '@/lib/module'
import type { Municipio } from '@/services/api/types'
import { cn } from '@/utils/cn'

export interface MunicipioFilterProps {
  /** Rótulo do menu (ex.: "Municípios de São Paulo"). */
  label: string
  options: Municipio[]
  /** Códigos IBGE selecionados. */
  selected: string[]
  onToggle: (codigo: string) => void
  /**
   * Códigos com resultado na busca atual. Quando definido, municípios fora
   * dele (e não selecionados) ficam desabilitados.
   */
  availableCodigos?: Set<string>
  module?: Module
  className?: string
}

/**
 * Normaliza texto para busca: minúsculas e sem acentos, para que "Sao Paulo"
 * case com "São Paulo".
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

/**
 * Menu de seleção múltipla de municípios de um estado: cada item é um checkbox
 * com o nome do município, e uma barra de busca filtra a lista. Itens
 * selecionados sobem para o topo.
 */
export function MunicipioFilter({
  label,
  options,
  selected,
  onToggle,
  availableCodigos,
  module,
  className,
}: MunicipioFilterProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const inputId = `${listId}-input`

  useEffect(() => {
    if (!open) return

    const close = () => {
      setOpen(false)
      setFilter('')
    }

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        close()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const selectedSet = new Set(selected)
  const rankFor = (municipio: Municipio): number => {
    if (selectedSet.has(municipio.codigo)) return 0
    if (
      availableCodigos === undefined ||
      availableCodigos.has(municipio.codigo)
    ) {
      return 1
    }
    return 2
  }
  const sorted = [...options].sort((a, b) => {
    const rank = rankFor(a) - rankFor(b)
    if (rank !== 0) return rank
    return a.nome.localeCompare(b.nome, 'pt-BR')
  })
  const normalizedFilter = normalize(filter)
  const visible = normalizedFilter
    ? sorted.filter((municipio) =>
        normalize(municipio.nome).includes(normalizedFilter),
      )
    : sorted

  const optionId = (codigo: string) => `${listId}-option-${codigo}`

  return (
    <div
      ref={rootRef}
      data-module={module}
      className={cn('relative', className)}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (open) {
            setOpen(false)
            setFilter('')
          } else {
            setOpen(true)
          }
        }}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-control border border-border-primary bg-surface-lv2 px-3 py-2.5',
          'font-sans text-sm text-fg transition-colors',
          'hover:border-fg-muted',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        )}
      >
        <span className="font-semibold">{label}</span>
        <span className="flex items-center gap-2">
          {selected.length > 0 && (
            <span
              aria-hidden="true"
              className="rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-accent-fg"
            >
              {selected.length}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'size-4 text-fg-muted transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </span>
      </button>

      {open && (
        <div
          className={cn(
            'absolute z-20 mt-1 w-full overflow-hidden rounded-panel border border-border-primary bg-surface-lv2 shadow-lg',
          )}
        >
          <div className="relative border-b border-border-primary p-2">
            <label htmlFor={inputId} className="sr-only">
              Buscar municípios
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Buscar município"
              className={cn(
                'w-full rounded-control border border-transparent bg-surface-lv1 py-2 pl-8 pr-3',
                'font-sans text-sm text-fg placeholder:text-fg-muted',
                'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-deep',
              )}
            />
          </div>

          <span className="sr-only" role="status" aria-live="polite">
            {visible.length} municípios
          </span>

          {visible.length > 0 ? (
            <ul
              id={listId}
              aria-label={label}
              className={cn('m-0 max-h-72 list-none overflow-auto p-0 py-1')}
            >
              {visible.map((municipio) => {
                const isSelected = selectedSet.has(municipio.codigo)
                const isDisabled =
                  availableCodigos !== undefined &&
                  !isSelected &&
                  !availableCodigos.has(municipio.codigo)
                return (
                  <li key={municipio.codigo}>
                    <label
                      htmlFor={optionId(municipio.codigo)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 font-sans text-sm text-fg',
                        'transition-colors',
                        isDisabled
                          ? 'cursor-not-allowed opacity-50'
                          : 'cursor-pointer hover:bg-accent/10',
                      )}
                    >
                      <Checkbox
                        id={optionId(municipio.codigo)}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => onToggle(municipio.codigo)}
                      />
                      <span>{municipio.nome}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="m-0 px-3 py-4 text-center font-sans text-sm text-fg-muted">
              Nenhum município encontrado
            </p>
          )}
        </div>
      )}
    </div>
  )
}
