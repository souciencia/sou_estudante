import { Tooltip } from '@/components/ui/tooltip'
import { Section, SubSection } from '../kit'

export function Experiments() {
  return (
    <Section
      id="experiments"
      title="Experiments"
      description="Componentes em exploração (v2), ainda não integrados às páginas."
    >
      <SubSection title="Testes">
        <Tooltip module="4">
          <Tooltip.Icon />
          <Tooltip.Content>
            Crie um componente chamado TooltipIcon, em `components/ui/tooltip/`.
            Termine o componente deixando-o funcional e com a capacidade de
            mudar de cores conforme `data-module`. - quero que o conteúdo de
            tooltipContent apareça através do click. Deve haver um botão para
            fechar. - No icone, deve haver um hover com a mensagem "Clique para
            saber mais" Implemente as funcionalidades e a estilização.
          </Tooltip.Content>
        </Tooltip>
      </SubSection>
    </Section>
  )
}
