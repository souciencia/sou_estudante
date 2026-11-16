import { ProfileRoutes } from '@/components/profile/profile-routes'
import { MODULE_META, MODULES } from '@/lib/module'
import { Section, SubSection } from '../kit'

export function Experiments() {
  return (
    <Section
      id="experiments"
      title="Experiments"
      description="Componentes em exploração (v2), ainda não integrados às páginas."
    >
      <SubSection title="ProfileRoutes · acento por módulo">
        <div className="flex flex-col gap-4">
          {MODULES.filter((module) => module !== '5').map((module) => (
            <div
              key={module}
              className="overflow-hidden rounded-panel border border-border-primary bg-surface-lv2-lv2-lv2"
            >
              <p className="px-5 pt-3 text-xs font-semibold text-fg-muted">
                module {module} · {MODULE_META[module].title}
              </p>
              <ProfileRoutes module={module} className="border-b-0" />
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}
