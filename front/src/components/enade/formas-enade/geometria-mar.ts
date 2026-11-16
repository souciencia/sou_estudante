/**
 * Paleta do "mar do Enade" — cores semânticas compartilhadas pela TagEnade e
 * pelos fundos do SeloEnade/MaskEnade. Sem JSX: só constantes tipadas.
 */

export type MarPalette = { color: string; background: string }

export const MAR_PALETTES: Record<string, MarPalette> = {
  ok: {
    color: 'var(--color-ok)',
    background: 'var(--color-ok-surface)',
  }, // faixas 5 e 4
  md: {
    color: 'var(--color-warn)',
    background: 'var(--color-warn-surface)',
  }, // faixa 3
  bad: {
    color: 'var(--color-low)',
    background: 'var(--color-low-surface)',
  }, // faixas 2 e 1
  neblina: {
    color: 'var(--color-fg-muted)',
    background: 'var(--color-muted)',
  },
}

export function marPalette(faixa: number | null): MarPalette {
  if (faixa === null) return MAR_PALETTES.neblina
  if (faixa >= 4) return MAR_PALETTES.ok
  if (faixa === 3) return MAR_PALETTES.md
  return MAR_PALETTES.bad
}
