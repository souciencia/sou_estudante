export const MODULES = ['1', '2', '3', '4', '5'] as const

export type Module = (typeof MODULES)[number]

export interface ModuleText {
  title: string
  description: string
}

/**
 * Copy do hero das páginas de módulo: título em duas partes (`lead` em destaque
 * forte e `accent` em itálico colorido) + subtítulo.
 */
export interface ModulePageCopy {
  lead: string
  accent: string
  subtitle: string
}

export interface ModuleMeta {
  badge: string
  title: string
  description: string
  page: ModulePageCopy
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
    page: {
      lead: 'Descobrir cursos',
      accent: 'é traçar a rota.',
      subtitle: 'Cursos do ensino superior no Brasil — fonte: Censo.',
    },
    list: {
      title: 'Escolha um curso',
      description:
        'A carta náutica mapeia as rotas possíveis: explore os cursos por área, local e modalidade.',
    },
    href: '/cursos',
  },
  '2': {
    badge: 'BÚSSOLA',
    title: 'Como ingressar',
    description: 'Notas de corte, vagas e cotas no Sisu',
    page: {
      lead: 'Ingresso',
      accent: 'via Sisu',
      subtitle:
        'Notas de corte, vagas e modalidades de cota — tudo pelo Enem. Dados da edição mais recente do Sisu.',
    },
    list: {
      title: 'Veja como ingressar',
      description:
        'A bússola aponta o caminho da entrada: notas de corte, vagas e cotas no Sisu.',
    },
    href: '/ingresso',
  },
  '3': {
    badge: 'ÂNCORA',
    title: 'Como permanecer',
    description: 'Cotas, assistência e apoios estudantis',
    page: {
      lead: 'Entrar é só o começo.',
      accent: 'Permanecer também conta.',
      subtitle:
        'Bolsas, cotas e apoios que ajudam a chegar até a formatura. Veja, por curso, quantos estudantes contaram com cada apoio — com o ano de referência sempre à vista.',
    },
    list: {
      title: 'Encontre apoio para permanecer',
      description:
        'A âncora segura você no percurso: bolsas, cotas e apoios para chegar até a formatura.',
    },
    href: '/permanencia',
  },
  '4': {
    badge: 'TELESCÓPIO',
    title: 'Conhecer instituição',
    description: 'Indicadores, docentes e qualidade',
    page: {
      lead: 'Antes de embarcar,',
      accent: 'olhe de perto.',
      subtitle:
        'Os indicadores oficiais da instituição — porte, cursos e corpo docente — traduzidos. O conceito de qualidade se lê no curso.',
    },
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
    page: {
      lead: 'Lado a lado,',
      accent: 'a escolha fica mais clara.',
      subtitle:
        'Compare até quatro cursos pelos mesmos critérios. Cada linha mostra de onde vem o dado e em que ano — sem somar tudo numa nota única, porque o que pesa mais é decisão sua.',
    },
    list: {
      title: 'Compare lado a lado',
      description:
        'O sextante mede posições para orientar a escolha: até quatro cursos comparados pelos mesmos critérios, sem ranking.',
    },
    href: '/comparar',
  },
}

/**
 * Módulo correspondente a um caminho da aplicação (ex.: `/cursos` → `'1'`).
 * Usado para destacar a rota ativa no `RoutesBar` e no cabeçalho interno.
 */
export function moduleFromPathname(pathname: string): Module | undefined {
  return MODULES.find((module) => {
    const { href } = MODULE_META[module]
    return pathname === href || pathname.startsWith(`${href}/`)
  })
}
