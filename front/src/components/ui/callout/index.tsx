import { CalloutContent } from './callout-content'
import { CalloutFooter } from './callout-footer'
import { CalloutHeader } from './callout-header'
import { CalloutHeaderContent } from './callout-header-content'
import { CalloutIcon } from './callout-icon'
import { CalloutRoot } from './callout-root'
import { CalloutTagline } from './callout-tagline'
import { CalloutTitle } from './callout-title'

export type { CalloutVariant } from './callout-root'

// Exceção (_docs/31.component-composition.md, seção 13): 7 subcomponentes, acima do limite de ~5. São
// partes de um bloco único (cabeçalho, corpo, rodapé) que os consumidores
// omitem e combinam de formas diferentes; cada uma embrulha só um elemento.
export const Callout = Object.assign(CalloutRoot, {
  Header: CalloutHeader,
  HeaderContent: CalloutHeaderContent,
  Icon: CalloutIcon,
  Tagline: CalloutTagline,
  Title: CalloutTitle,
  Content: CalloutContent,
  Footer: CalloutFooter,
})
