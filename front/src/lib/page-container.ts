const INNER_PATHS = [
  '/cursos',
  '/ies',
  '/ingresso',
  '/comparar',
  '/permanencia',
  '/metodologia',
  '/sobre',
] as const

export type PageContainer = 'home' | 'pages' | 'detail' | 'full'

/**
 * Tipo de contêiner conforme o caminho: a home e as páginas de lista
 * (`/cursos`, `/ies`, …) usam `max-w-home`, as páginas de detalhe
 * (`/cursos/[id]`, …) usam `max-w-2xl` e a página de design system usa largura
 * total (`max-w-none`). Fonte única para Header e Footer assumirem a mesma
 * largura por página.
 */
export function pageContainer(pathname: string): PageContainer {
  if (pathname === '/') return 'home'
  if (pathname === '/design-system') return 'full'
  if ((INNER_PATHS as readonly string[]).includes(pathname)) return 'pages'
  return 'detail'
}

export const PAGE_CONTAINER_CLASS: Record<PageContainer, string> = {
  home: 'max-w-home',
  pages: 'max-w-home',
  detail: 'max-w-2xl',
  full: 'max-w-none',
}
