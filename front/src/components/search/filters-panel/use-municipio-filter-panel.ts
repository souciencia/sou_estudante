'use client'

import { useCallback } from 'react'
import type { MunicipiosMap } from '@/services/api/types'
import { useFilterPanel } from './use-filter-panel'

export interface UseMunicipioFilterPanelReturn {
  /** Valores ativos de uma chave na URL (ex.: uf -> ['SP','RJ']). */
  getActiveValues: (key: string) => string[]
  /** Roteia o toggle do painel: UF passa pela limpeza dos seus municípios. */
  onToggle: (key: string, value: string) => void
  /** Aplica o estado completo, removendo municípios de UFs não selecionadas. */
  onApply: (values: Record<string, string[]>) => void
}

/**
 * Handlers de filtro do painel com a regra de município por UF: ao desmarcar
 * um estado, os municípios dele saem da URL (evita filtro invisível). Usado por
 * `FiltersPanelCursos` e `FiltersPanelIes`.
 */
export function useMunicipioFilterPanel(
  updateParams: (params: Record<string, string | null>) => void,
  municipios: MunicipiosMap,
): UseMunicipioFilterPanelReturn {
  const { getActiveValues, toggle, apply } = useFilterPanel(updateParams)

  const onToggle = useCallback(
    (key: string, value: string) => {
      if (key !== 'uf') {
        toggle(key, value)
        return
      }

      const activeUfs = getActiveValues('uf')
      const removing = activeUfs.includes(value)
      const nextUfs = removing
        ? activeUfs.filter((uf) => uf !== value)
        : [...activeUfs, value]

      const activeMunicipios = getActiveValues('municipio')
      const nextMunicipios = removing
        ? subtractMunicipios(activeMunicipios, municipios[value] ?? [])
        : activeMunicipios

      updateParams({
        uf: nextUfs.length > 0 ? nextUfs.join(',') : null,
        municipio: nextMunicipios.length > 0 ? nextMunicipios.join(',') : null,
        page: '1',
      })
    },
    [getActiveValues, municipios, toggle, updateParams],
  )

  const onApply = useCallback(
    (values: Record<string, string[]>) => {
      apply(stripOrphanMunicipios(values, municipios))
    },
    [apply, municipios],
  )

  return { getActiveValues, onToggle, onApply }
}

function subtractMunicipios(
  selected: string[],
  municipiosDaUF: { codigo: string }[],
): string[] {
  const codes = new Set(municipiosDaUF.map((m) => m.codigo))
  return selected.filter((codigo) => !codes.has(codigo))
}

function stripOrphanMunicipios(
  values: Record<string, string[]>,
  municipios: MunicipiosMap,
): Record<string, string[]> {
  const selectedUfs = new Set(values.uf ?? [])
  const codigoToUf = new Map<string, string>()
  for (const [uf, list] of Object.entries(municipios)) {
    for (const municipio of list) {
      codigoToUf.set(municipio.codigo, uf)
    }
  }

  const kept = (values.municipio ?? []).filter((codigo) => {
    const uf = codigoToUf.get(codigo)
    return uf === undefined || selectedUfs.has(uf)
  })

  return { ...values, municipio: kept }
}
