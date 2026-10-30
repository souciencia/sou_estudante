import { cn } from '@/utils/cn'
import { Section, SubSection, Swatch, SwatchGrid } from '../kit'

export function Tokens() {
  return (
    <Section
      id="tokens"
      title="Tokens"
      description="Fonte única em src/app/globals.css (@theme). Os valores abaixo são lidos direto dos tokens — não são copiados para cá."
    >
      <SubSection title="Acentos por módulo">
        <SwatchGrid>
          {MODULE_COLORS.map(({ token, name, value }) => (
            <Swatch key={token} token={token} name={name} value={value} />
          ))}
        </SwatchGrid>
      </SubSection>

      <SubSection title="Feedback">
        <SwatchGrid>
          {FEEDBACK_COLORS.map(({ token, name, value }) => (
            <Swatch key={token} token={token} name={name} value={value} />
          ))}
        </SwatchGrid>
      </SubSection>

      <SubSection title="Neutros e superfícies">
        <SwatchGrid>
          {NEUTRAL_COLORS.map(({ token, name, value }) => (
            <Swatch key={token} token={token} name={name} value={value} />
          ))}
        </SwatchGrid>
      </SubSection>

      <SubSection title="Tipografia">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-6">
            <span className="font-sans text-base text-fg">
              Sans · corpo · <span className="font-semibold">semibold</span>
            </span>
            <span className="font-display text-base text-fg">
              Display · títulos
            </span>
            <span className="font-mono text-base text-fg">Mono · dados</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-6 rounded-panel border border-border-primary bg-surface-lv2 p-5">
            {FONT_SCALE.map(({ className, label }) => (
              <span key={label} className={className}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </SubSection>

      <SubSection title="Formas (raios)">
        <div className="flex flex-wrap items-center gap-6 rounded-panel border border-border-primary bg-surface-lv2 p-5">
          {RADII.map(({ className, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span
                className={cn(
                  'block h-16 w-16 border border-accent bg-accent/10',
                  className,
                )}
              />
              <span className="font-mono text-2xs text-fg-muted">{label}</span>
            </div>
          ))}
        </div>
      </SubSection>
    </Section>
  )
}

const MODULE_COLORS = [
  {
    token: '--color-m1-accent',
    name: 'm1 accent',
    value: 'oklch(93.6% 0.225 121.24)',
  },
  { token: '--color-m1-deep', name: 'm1 deep', value: 'oklch(50% 0.1213 121)' },
  {
    token: '--color-m2-accent',
    name: 'm2 accent',
    value: 'oklch(84.4% 0.145 209.29)',
  },
  { token: '--color-m2-deep', name: 'm2 deep', value: 'oklch(48% 0.0834 209)' },
  {
    token: '--color-m3-accent',
    name: 'm3 accent',
    value: 'oklch(72.9% 0.205 347.95)',
  },
  { token: '--color-m3-deep', name: 'm3 deep', value: 'oklch(48% 0.1821 351)' },
  {
    token: '--color-m4-accent',
    name: 'm4 accent',
    value: 'oklch(65.7% 0.221 302.89)',
  },
  { token: '--color-m4-deep', name: 'm4 deep', value: 'oklch(41% 0.1961 296)' },
  {
    token: '--color-m5-accent',
    name: 'm5 accent',
    value: 'oklch(75.4% 0.165 52.47)',
  },
  { token: '--color-m5-deep', name: 'm5 deep', value: 'oklch(51% 0.1368 49)' },
]

const FEEDBACK_COLORS = [
  { token: '--color-ok', name: 'ok', value: 'oklch(56% 0.121 158)' },
  {
    token: '--color-ok-surface',
    name: 'ok surface',
    value: 'oklch(96% 0.018 166)',
  },
  { token: '--color-warn', name: 'warn', value: 'oklch(57% 0.135 59)' },
  {
    token: '--color-warn-surface',
    name: 'warn surface',
    value: 'oklch(96% 0.028 79)',
  },
  { token: '--color-low', name: 'low', value: 'oklch(54% 0.174 29)' },
  {
    token: '--color-low-surface',
    name: 'low surface',
    value: 'oklch(95% 0.018 25)',
  },
  { token: '--color-info', name: 'info', value: 'oklch(81% 0.055 215)' },
  {
    token: '--color-info-deep',
    name: 'info deep',
    value: 'oklch(29% 0.066 243)',
  },
  {
    token: '--color-info-border',
    name: 'info border',
    value: 'oklch(88% 0.051 221)',
  },
  {
    token: '--color-info-surface',
    name: 'info surface',
    value: 'oklch(100% 0 0)',
  },
]

const NEUTRAL_COLORS = [
  {
    token: '--color-surface-lv0',
    name: 'surface lv0',
    value: 'oklch(93% 0.0222 312)',
  },
  {
    token: '--color-surface-lv0-top',
    name: 'surface lv0 top',
    value: 'oklch(93% 0.03 250)',
  },
  {
    token: '--color-surface-lv1',
    name: 'surface lv1',
    value: 'oklch(97% 0.0102 311)',
  },
  {
    token: '--color-surface-lv2',
    name: 'surface lv2',
    value: 'oklch(100% 0 0)',
  },
  {
    token: '--color-border-primary',
    name: 'border primary',
    value: 'oklch(0.92 0 0)',
  },
  {
    token: '--color-border-secondary',
    name: 'border secondary',
    value: 'oklch(93.6% 0.022 312.18)',
  },
  { token: '--color-fg', name: 'fg', value: 'oklch(19.19% 0.0441 309.16)' },
  {
    token: '--color-fg-muted',
    name: 'fg muted',
    value: 'oklch(45.48% 0.0339 305.48)',
  },
  { token: '--color-muted', name: 'muted', value: 'oklch(96.7% 0 264)' },
  { token: '--color-on-dark', name: 'on dark', value: 'oklch(100% 0 0)' },
]

const FONT_SCALE = [
  { className: 'font-sans text-2xs text-fg', label: '2xs 10px' },
  { className: 'font-sans text-xs text-fg', label: 'xs 12px' },
  { className: 'font-sans text-sm text-fg', label: 'sm 14px' },
  { className: 'font-sans text-base text-fg', label: 'base 16px' },
  { className: 'font-sans text-xl text-fg', label: 'xl 20px' },
  { className: 'font-sans text-4xl text-fg', label: '4xl 36px' },
  { className: 'font-display text-display text-fg', label: 'display' },
]

const RADII = [
  { className: 'rounded-card', label: 'card 20px' },
  { className: 'rounded-callout', label: 'callout 18px' },
  { className: 'rounded-panel', label: 'panel 14px' },
  { className: 'rounded-control', label: 'control 10px' },
  { className: 'rounded-full', label: 'full' },
]
