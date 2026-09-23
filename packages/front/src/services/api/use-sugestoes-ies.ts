// src/services/api/use-sugestoes-ies.ts
'use client'

import { iesService } from '@/services/api/ies.service'
import { type UseSugestoesReturn, useSugestoes } from './use-sugestoes'

export type UseSugestoesIesReturn = UseSugestoesReturn

export function useSugestoesIes(termo: string): UseSugestoesIesReturn {
  return useSugestoes(termo, iesService.sugerirIes)
}
