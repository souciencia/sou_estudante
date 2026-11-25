import { MarLegenda } from '@/components/enade/formas-enade/mar-legenda'
import { MaskEnade } from '@/components/enade/mask-enade/mask-enade'
import { SeloEnade } from '@/components/enade/selo-enade/selo-enade'
import { Card } from '@/components/ui/card'
import { TagEnade } from '@/components/ui/tag/wrappers/tag-enade/tag-enade'
import type { EnadeLevel } from '@/lib/enade'
import { Section, State, States, SubSection } from '../kit'

const LEVELS: Array<{ level: EnadeLevel; label: string }> = [
  { level: 5, label: '5' },
  { level: 4, label: '4' },
  { level: 3, label: '3' },
  { level: 2, label: '2' },
  { level: 1, label: '1' },
  { level: 'SC', label: 'SC' },
  { level: null, label: 'null' },
]

export function EnadeSection() {
  return (
    <Section
      id="enade"
      title="Enade"
      description="Selo, tag e máscara do mar do Enade. O selo é a fonte da informação acessível; a máscara e o desenho são decorativos."
    >
      <SubSection title="SeloEnade · sm">
        <States>
          {LEVELS.map(({ level, label }) => (
            <State key={`sm-${label}`} label={label}>
              <SeloEnade level={level} size="sm" />
            </State>
          ))}
        </States>
      </SubSection>

      <SubSection title="SeloEnade · md">
        <States>
          {LEVELS.map(({ level, label }) => (
            <State key={`md-${label}`} label={label}>
              <SeloEnade level={level} size="md" />
            </State>
          ))}
        </States>
      </SubSection>

      <SubSection title="SeloEnade · lg">
        <States>
          {LEVELS.map(({ level, label }) => (
            <State key={`lg-${label}`} label={label}>
              <SeloEnade level={level} size="lg" />
            </State>
          ))}
        </States>
      </SubSection>

      <SubSection title="TagEnade">
        <States>
          {LEVELS.map(({ level, label }) => (
            <State key={`tag-${label}`} label={label}>
              <TagEnade level={level} />
            </State>
          ))}
        </States>
      </SubSection>

      <SubSection title="MaskEnade + SeloEnade no card">
        <div className="max-w-xl">
          <Card module="2">
            <Card.Backdrop>
              <MaskEnade level={5} />
            </Card.Backdrop>
            <Card.Header className="gap-3">
              <SeloEnade level={5} size="md" />
              <div>
                <h4 className="font-display font-bold text-base">
                  Medicina · 16904
                </h4>
                <h5 className="font-sans text-fg-muted text-sm">
                  Universidade Federal de Roraima · Boa Vista - RR
                </h5>
              </div>
            </Card.Header>
            <Card.Tags
              source={[
                'Gratuito',
                'Presencial',
                'Integral',
                <TagEnade key="enade" level={5} />,
              ]}
            />
            <Card.ProgressBar
              title="Taxa de desistência acumulada (5 anos)"
              percentage="17%"
            />
          </Card>
        </div>
      </SubSection>

      <SubSection title="MarLegenda">
        <div className="max-w-xl rounded-panel border border-border-primary bg-surface-lv2 p-4">
          <MarLegenda />
        </div>
      </SubSection>
    </Section>
  )
}
