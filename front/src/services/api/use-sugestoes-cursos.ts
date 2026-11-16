'use client'

import { cursoService } from '@/services/api/curso.service'
import { type UseSugestoesReturn, useSugestoes } from './use-sugestoes'

export type UseSugestoesCursosReturn = UseSugestoesReturn

export function useSugestoesCursos(termo: string): UseSugestoesCursosReturn {
  return useSugestoes(termo, cursoService.sugerirCursos)
}
