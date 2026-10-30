import { Comparar } from '@/components/compare/comparar'
// import { RoutesBar } from '@/components/layout/routes-bar/routes-bar'
import { IconModule } from '@/components/ui/icon-module/icon-module'
import { MODULE_META, type Module } from '@/lib/module'

const module: Module = '5'
const meta = MODULE_META[module]

export default function CompararPage() {
  return (
    <div data-module={module}>
      <div className="mx-auto w-full min-h-page max-w-pages px-5 py-8 bg-surface-lv1 rounded-b-callout shadw">
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

        <Comparar module={module} />
      </div>
    </div>
  )
}
