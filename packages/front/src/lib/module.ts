export const MODULES = ['1', '2', '3', '4', '5'] as const

export type Module = (typeof MODULES)[number]

export interface ModuleMeta {
  badge: string
  title: string
  description: string
  href: string
}

/**
 * Fonte única dos rótulos de cada módulo (usada pela navegação `Route` e
 * pelo cabeçalho das páginas de detalhe).
 */
export const MODULE_META: Record<Module, ModuleMeta> = {
  '1': {
    badge: 'CARTA NÁUTICA',
    title: 'Escolher curso',
    description: 'Explore por área, localização e modalidade',
    href: '#',
  },
  '2': {
    badge: 'BÚSSOLA',
    title: 'Como ingressar',
    description: 'Notas de corte, vagas e cotas no Sisu',
    href: '#',
  },
  '3': {
    badge: 'ÂNCORA',
    title: 'Como permanecer',
    description: 'Cotas, assistência e apoios estudantis',
    href: '#',
  },
  '4': {
    badge: 'TELESCÓPIO',
    title: 'Conhecer instituição',
    description: 'Indicadores, docentes e qualidade',
    href: '/ies',
  },
  '5': {
    badge: 'SEXTANTE',
    title: 'Comparar cursos',
    description: 'Analise até 4 cursos lado a lado',
    href: '#',
  },
}
