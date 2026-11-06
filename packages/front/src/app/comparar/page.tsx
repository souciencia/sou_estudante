import { Info } from 'lucide-react'
import { Comparar } from '@/components/compare/comparar'
import { CourseSearchRedirect } from '@/components/search/course-search-redirect/course-search-redirect'
// import { RoutesBar } from '@/components/layout/routes-bar/routes-bar'
import { Callout } from '@/components/ui/callout'
import { IconModule } from '@/components/ui/icon-module/icon-module'
import { MODULE_META, type Module } from '@/lib/module'

const module: Module = '5'
const meta = MODULE_META[module]

export default function CompararPage() {
  return (
    <div data-module={module}>
      <div className="mx-auto w-full min-h-page max-w-home px-5 py-8 bg-surface-lv1 rounded-b-callout shadw">
        {/* <RoutesBar module={module} /> */}
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2 font-sans text-xs font-bold tracking-[0.9px] text-accent-deep uppercase">
            <IconModule module={module} />
            {meta.badge}
          </div>

          <h1 className="block font-sans text-display font-bold leading-[1.08] tracking-[-0.02em] text-fg">
            {meta.page.lead}{' '}
            <em className="font-bold text-accent-deep italic">
              {meta.page.accent}
            </em>
          </h1>

          <p className="mt-1.5 font-sans text-base text-fg-muted">
            {meta.page.subtitle}
          </p>
        </header>

        <div className="mb-6">
          <CourseSearchRedirect
            module={module}
            to="comparar"
            title="Quais cursos você quer comparar?"
            description="Busque cursos e selecione até 5 para colocar lado a lado."
          />
        </div>

        <Callout v="module" className="mb-6">
          <Callout.Header>
            <Callout.Icon>
              <Info aria-hidden="true" />
            </Callout.Icon>
            <Callout.HeaderContent>
              <Callout.Tagline>Para você, estudante</Callout.Tagline>
              <Callout.Title>Cursos diferentes podem ter vantagens diferentes para você.</Callout.Title>
            </Callout.HeaderContent>
          </Callout.Header>
          <Callout.Content>
            <p>
              Um curso pode ficar mais perto de casa; outro pode ter uma forma de ingresso 
              mais adequada à sua situação. Um pode ser gratuito; outro pode oferecer características 
              que você considera importantes.
            </p>
            <p>
              Compare cada informação separadamente e observe sempre a fonte e o ano. A nota de corte, 
              por exemplo, ajuda a entender resultados anteriores do Sisu — não mede a qualidade do curso.
            </p>
            <p>
              A escolha final é sua.
            </p>
          </Callout.Content>
          <Callout.Footer>
            — SoU_Estudante · SoU_Ciência / Unifesp
          </Callout.Footer>
        </Callout>

        <Comparar module={module} />
      </div>
    </div>
  )
}
