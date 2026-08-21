import attention from '@/assets/attention.svg'
import bussula from '@/assets/bussula.svg'

interface IconSwitcherProps {
  /** Nome do ícone a ser incorporado — corresponde a um .svg em `src/assets`. */
  icon?: string
  className?: string
}

/**
 * IconSwitcher — incorpora um dos .svg de `src/assets` dependendo do
 * valor da propriedade `icon`.
 */
export function IconSwitcher({ icon }: IconSwitcherProps) {
  switch (icon) {
    case 'attention':
      return attention
    case 'bussula':
      return bussula
    default:
      return null
  }
}
