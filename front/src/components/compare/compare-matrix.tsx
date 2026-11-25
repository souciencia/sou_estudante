import { X } from 'lucide-react'
import { Fragment } from 'react'
import type { Module } from '@/lib/module'
import type { Curso } from '@/services/api/types'
import { cn } from '@/utils/cn'
import { Button } from '../ui/button/button'
import { buildCompareSections } from './compare-rows'

interface CompareMatrixProps {
  /** Cursos a comparar, na ordem das colunas; `null` = não encontrado. */
  cursos: (Curso | null)[]
  onRemove: (index: number) => void
  /** Limpa a seleção de comparação (remove todos os cursos). */
  onClear: () => void
  module?: Module
}

/**
 * Matriz lado a lado dos cursos selecionados: uma coluna por curso, uma linha
 * por critério, agrupadas em seções com a fonte do dado. É uma tabela real
 * (`<table>`) para manter a associação rótulo/valor acessível.
 */
export function CompareMatrix({
  cursos,
  onRemove,
  onClear,
  module,
}: CompareMatrixProps) {
  const sections = buildCompareSections(cursos)

  return (
    <div
      data-module={module}
      className="overflow-x-auto rounded-panel border border-border-primary bg-surface-lv2"
    >
      <table className="w-full border-collapse text-left">
        <thead className={cn('border-b-2 border-m5-deep')}>
          <tr className="border-b border-border-primary">
            <th
              scope="col"
              className="w-40 min-w-40 p-4 align-top text-xs font-bold uppercase tracking-[0.9px] text-fg-muted"
            >
              Critério
            </th>
            {cursos.map((curso, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: colunas fixas por posição
              <th key={index} scope="col" className="min-w-52 p-4 align-top">
                {curso ? (
                  <div className="space-y-1">
                    <div className="font-display font-bold text-base text-fg">
                      {curso.curso?.no_curso}
                    </div>
                    <div className="font-sans text-sm text-fg-muted">
                      {curso.instituicao?.no_ies}
                    </div>
                    <Button
                      module={module}
                      v="outline"
                      onClick={() => onRemove(index)}
                      aria-label={`Remover ${curso.curso?.no_curso ?? 'curso'}`}
                      className="px-3 py-0.5 text-xs"
                    >
                      <X className="size-3" aria-hidden="true" />
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="font-sans text-sm text-fg-muted">
                    Curso não encontrado
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border-primary">
            <td colSpan={cursos.length + 1} className="p-4 text-right">
              <Button module={module} v="outline" onClick={onClear}>
                Remover todos
              </Button>
            </td>
          </tr>
          {sections.map((section) => (
            <Fragment key={section.title}>
              <tr className="border-t border-border-primary bg-muted">
                <th
                  scope="rowgroup"
                  colSpan={cursos.length + 1}
                  className="p-4 text-left"
                >
                  <span className="font-sans text-xs font-bold uppercase tracking-[0.9px] text-fg">
                    {section.title}
                  </span>{' '}
                  <span className="font-sans text-xs text-fg-muted">
                    · {section.source}
                  </span>
                </th>
              </tr>
              {section.rows.map((row) => {
                const cellClass = cn(
                  'border-l border-border-primary p-4 text-sm text-fg',
                  row.numeric ? 'font-mono font-bold' : 'font-sans',
                )

                return (
                  <tr
                    key={row.label}
                    className="border-t border-border-primary"
                  >
                    <th
                      scope="row"
                      className={cn(
                        'p-4 text-left font-sans text-sm text-fg',
                        section.plainLabels ? 'font-normal' : 'font-semibold',
                      )}
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, index) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: células alinhadas às colunas
                      <td key={index} className={cellClass}>
                        {value ?? '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
