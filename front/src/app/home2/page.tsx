import { Hero2 } from '@/components/layout/hero/hero2'
import { Route } from '@/components/ui/route/route'
import { MODULES } from '@/lib/module'

export default function Home() {
  return (
    <div className="bg-surface-lv1 rounded-b-lg mx-auto w-full min-[860px]:max-w-home shadw">
      <Hero2 />

      <div className="px-5 pb-8 pt-10">
        <section>
          <div className="mb-2.5 text-center text-xs font-bold uppercase tracking-[0.9px] text-fg-muted">
            Por onde você quer começar?
          </div>

          <h2 className="mb-3 text-center font-display text-[clamp(1.6rem,4.2vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.3px] text-fg">
            Cinco rotas para
            <br />
            <em className="italic text-m1-deep">a sua decisão.</em>
          </h2>

          <p className="mx-auto mb-[1.875rem] max-w-[520px] text-center text-sm leading-[1.6] text-fg-muted">
            Escolha a pergunta que mais interessa a você agora. Não há uma ordem
            certa
            <br />
            para começar.
          </p>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 max-w-[820px] mx-auto">
            {MODULES.map((module) => (
              <Route key={module} module={module} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
