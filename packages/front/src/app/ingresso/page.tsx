import { Info } from 'lucide-react'
import { LayoutSearchPage } from '@/components/layout/layout-search-page'
import { CourseSearchRedirect } from '@/components/search/course-search-redirect/course-search-redirect'
import { Callout } from '@/components/ui/callout'

export default function IngressoPage() {
  return (
    <LayoutSearchPage
      module="2"
      searchEntry={
        <CourseSearchRedirect
          module="2"
          to="ingresso"
          title="Busque cursos com vagas no Sisu"
        />
      }
      notice={
        <>
          <Callout v="module">
            <Callout.Header>
              <Callout.Icon>
                <Info aria-hidden="true" />
              </Callout.Icon>
              <Callout.HeaderContent>
                <Callout.Tagline>Sisu</Callout.Tagline>
                <Callout.Title>O que é o Sisu?</Callout.Title>
              </Callout.HeaderContent>
            </Callout.Header>
            <Callout.Content>
              <p>
                O Sistema de Seleção Unificada (Sisu) reúne vagas oferecidas 
                por instituições públicas de ensino superior. Para concorrer, 
                você usa sua nota do Enem e pode escolher até duas opções de curso.
              </p>
              <p>
                Aqui você encontra informações da edição 2026, como vagas, modalidades
                de concorrência e a nota do último candidato classificado na chamada regular.
              </p>
              <p>
                Nem todas as instituições públicas oferecem todas as suas vagas pelo Sisu. 
                Para conhecer outras formas de ingresso, consulte também o site da instituição.
              </p>
            </Callout.Content>
          </Callout>

          <Callout v="blue" className="mt-3">
            <Callout.Header>
              <Callout.Icon>
                <Info aria-hidden="true" />
              </Callout.Icon>
              <Callout.HeaderContent>
                <Callout.Tagline>Para você, estudante</Callout.Tagline>
                <Callout.Title>
                  A nota de corte é <i>uma referência</i>, não uma previsão.
                </Callout.Title>
              </Callout.HeaderContent>
            </Callout.Header>
            <Callout.Content>
              <p>
                Os dados que você encontra aqui são do Sisu do ano passado. 
                As notas podem mudar a cada processo seletivo, conforme o número de vagas, 
                os candidatos e suas notas.
              </p>
              <p>
                Se você não for selecionado na chamada regular, acompanhe as regras e 
                os prazos da lista de espera. Inscrição, manifestação de interesse, convocações 
                e matrícula têm datas próprias. Perder um prazo pode significar perder a vaga.
              </p>
            </Callout.Content>
            <Callout.Footer>
              — SoU_Estudante · SoU_Ciência / Unifesp · Sisu
            </Callout.Footer>
          </Callout>
        </>
      }
    />
  )
}
