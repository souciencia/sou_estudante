export const MODULES = ['1', '2', '3', '4', '5'] as const

export type Module = (typeof MODULES)[number]

export interface ModuleText {
  title: string
  description: string
}

export interface ModuleMeta {
  badge: string
  title: string
  description: string
  list: ModuleText
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
    list: {
      title: 'Escolha um curso',
      description:
        'A carta náutica mapeia as rotas possíveis: explore os cursos por área, local e modalidade.',
    },
    href: '#',
  },
  '2': {
    badge: 'BÚSSOLA',
    title: 'Como ingressar',
    description: 'Notas de corte, vagas e cotas no Sisu',
    list: {
      title: 'Veja como ingressar',
      description:
        'A bússola aponta o caminho da entrada: notas de corte, vagas e cotas no Sisu.',
    },
    href: '#',
  },
  '3': {
    badge: 'ÂNCORA',
    title: 'Como permanecer',
    description: 'Cotas, assistência e apoios estudantis',
    list: {
      title: 'Encontre apoio para permanecer',
      description:
        'A âncora segura você no percurso: bolsas, cotas e apoios para chegar até a formatura.',
    },
    href: '#',
  },
  '4': {
    badge: 'TELESCÓPIO',
    title: 'Conhecer instituição',
    description: 'Indicadores, docentes e qualidade',
    list: {
      title: 'Conheça a instituição',
      description:
        'O telescópio aproxima o que está longe: os indicadores oficiais da instituição, traduzidos.',
    },
    href: '/ies',
  },
  '5': {
    badge: 'SEXTANTE',
    title: 'Comparar cursos',
    description: 'Analise até 4 cursos lado a lado',
    list: {
      title: 'Compare lado a lado',
      description:
        'O sextante mede posições para orientar a escolha: até quatro cursos comparados pelos mesmos critérios, sem ranking.',
    },
    href: '#',
  },
}
