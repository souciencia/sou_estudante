import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { CourseSearchRedirect } from '@/components/search/course-search-redirect/course-search-redirect'
import { Callout } from '@/components/ui/callout'
import { IconModule } from '@/components/ui/icon-module/icon-module'

export default function PermanenciaPage() {
  return (
    <LayoutSearchPage
      module="3"
      searchEntry={
        <CourseSearchRedirect
          module="3"
          to="permanencia"
          title="Conheça os apoios aos estudantes. De qual curso você quer saber?"
          description="Busque seu curso."
        />
      }
      notice={
        <Callout v="module">
          <Callout.Header>
            <Callout.Icon>
              <IconModule module="3" />
            </Callout.Icon>
            <Callout.HeaderContent>
              <Callout.Tagline>Para você, estudante</Callout.Tagline>
              <Callout.Title>
                Permanecer também <em>faz parte da rota.</em>
              </Callout.Title>
            </Callout.HeaderContent>
          </Callout.Header>
          <Callout.Content>
            <p>
              Moradia, alimentação, transporte e condições financeiras podem fazer 
              diferença para continuar estudando. As instituições e os programas 
              públicos oferecem diferentes formas de apoio.
            </p>
            <p>
              Aqui você pode consultar quantos estudantes tiveram apoio social, 
              participaram de atividades extracurriculares, receberam ProUni ou utilizaram 
              Fies, além de quantos ingressaram por reserva de vagas.
            </p>
            <p>
              Os dados se referem ao ano indicado em cada informação e não mostram, necessariamente, 
              todos os apoios disponíveis hoje. Por isso, consulte também o site da instituição.
            </p>
          </Callout.Content>
          <Callout.Footer>
            — SoU_Estudante · SoU_Ciência / Unifesp · Censo da Educação Superior
          </Callout.Footer>
        </Callout>
      }
    />
  )
}
