/**
 * Núcleo funcional do "mar do Enade" — dados e geometria compartilhados
 * pelo SeloEnade (Céu, Ondas) e pela BandaMar. Parâmetros portados do
 * v21 (MAR_P); faixa 1 usa os da 2 (marFaixa). Sem JSX: só funções
 * puras e constantes tipadas.
 */

export interface ParamsMar {
  a: number // amplitude
  wl: number // comprimento de onda
  yb: number // y da onda de trás
  yf: number // y da onda da frente
}

// Parâmetros do v21 (MAR_P); faixa 1 usa os da 2 (marFaixa)
export const MAR_P: Record<number, ParamsMar> = {
  5: { a: 1.1, wl: 40, yb: 57, yf: 64 },
  4: { a: 2.4, wl: 28, yb: 55, yf: 63 },
  3: { a: 4, wl: 22, yb: 53, yf: 62 },
  2: { a: 6.5, wl: 16, yb: 49, yf: 60 },
}
export const NEBLINA_P: ParamsMar = { a: 2, wl: 30, yb: 55, yf: 63 }

export type PaletaMar = { cor: string; fundo: string }

export const CORES_MAR: Record<string, PaletaMar> = {
  ok: { cor: '#1B8A5A', fundo: '#E8F7F0' }, // faixas 5 e 4
  md: { cor: '#B06000', fundo: '#FFF3E0' }, // faixa 3
  bad: { cor: '#C0392B', fundo: '#FDECEA' }, // faixas 2 e 1
  neblina: {
    cor: 'var(--color-text-muted)',
    fundo: 'var(--color-surface-alt)',
  },
}

export function caminhoOnda(y: number, amp: number, wl: number): string {
  let d = `M ${-wl} ${y} Q ${-wl + wl / 4} ${y - amp} ${-wl + wl / 2} ${y}`
  for (let x = -wl + wl / 2; x < 170; x += wl / 2) {
    d += ` T ${x + wl / 2} ${y}`
  }
  return `${d} L 180 92 L ${-wl - 10} 92 Z`
}

export function faixaDoMar(faixa: number): 2 | 3 | 4 | 5 {
  if (faixa >= 5) return 5
  if (faixa === 4) return 4
  if (faixa === 3) return 3
  return 2
}

export function parametrosMar(faixa: number | null): ParamsMar {
  return faixa === null ? NEBLINA_P : MAR_P[faixaDoMar(faixa)]
}

export function paletaMar(faixa: number | null): PaletaMar {
  if (faixa === null) return CORES_MAR.neblina
  if (faixa >= 4) return CORES_MAR.ok
  if (faixa === 3) return CORES_MAR.md
  return CORES_MAR.bad
}
