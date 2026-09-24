export interface SiteMenuLink {
  href: string
  label: string
}

export const SITE_MENU_LINKS: SiteMenuLink[] = [
  { href: '/', label: 'Início' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/ies', label: 'Instituições' },
]
