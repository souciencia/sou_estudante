import { Button } from '@/components/atoms/button'
import { Route } from '@/components/features/route/route'
import { Header } from '@/components/site-blocks/header'
import { Hero } from '@/components/site-blocks/hero'
import { MODULES } from '@/lib/module'

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen flex-col min-[860px]:max-w-[900px] bg-site-background">
      <Header />

      <main className="flex-1">
        <Hero />

        <div className="bg-site-background px-5 pb-8 pt-10">

          <section>
            <div className="mb-2.5 text-center text-coadjuvant-xs font-bold uppercase tracking-[0.9px] text-text-muted">
              Por onde você quer começar?
            </div>

            <h2 className="mb-3 text-center font-display text-[clamp(1.6rem,4.2vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.3px] text-text">
              Cinco rotas para
              <br/>
              <em className="italic text-m1-deep">a sua decisão.</em>
            </h2>

            <p className="mx-auto mb-[1.875rem] max-w-[520px] text-center text-sm leading-[1.6] text-text-muted">
              Cada módulo responde a uma pergunta da sua jornada. Acesse-os na ordem
              que fizer sentido para você.
            </p>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 max-w-[820px] mx-auto">
              {MODULES.map((module) => (
                <Route key={module} module={module} />
              ))}
            </div>

          </section>

          <section id="howto" className="mx-auto mt-9 max-w-[680px]">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5">

              <div className="text-coadjuvant-xs font-bold uppercase tracking-[0.9px] text-text-muted">
                Como funciona
              </div>

              <Button
                type="button"
                /*onClick={() => iniciarTour()}*/
                className="inline-flex cursor-pointer items-center gap-[6px] rounded-[20px] border-none bg-text px-[0.9rem] py-[0.45rem] font-coadjuvant text-coadjuvant-sm font-semibold text-white"
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="h-[10px] w-[10px]"
                  aria-hidden
                >
                  <path d="M3 2L10 6L3 10Z" fill="currentColor" />
                </svg>
                Ver passo a passo guiado
              </Button>

            </div>

            <p className="mb-4 max-w-[600px] text-coadjuvant-sm leading-[1.55] text-text-muted">
              Cada módulo leva o nome de um instrumento de navegação. Escolher onde
              estudar também é traçar uma rota.
            </p>

            <div className='grid gap-2'>
              {MODULES.map((module) => (
                <Route key={module} module={module} variant="list" />
              ))}
            </div>

          </section>

        </div>

      </main>

      <footer className="mt-auto border-t border-plum-100 bg-surface px-5 py-3.5">
        <p className="text-coadjuvant-xs leading-[1.6] text-text-muted">
          Um produto do <strong>SoU_Ciência · Unifesp</strong> · Dados
          públicos ·{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/deed.pt-br"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Licença Creative Commons BY 4.0
          </a>{" "}
          · Censo da Educação Superior (INEP) · e-MEC · Sisu
        </p>
      </footer>
    </div>
  )
}
