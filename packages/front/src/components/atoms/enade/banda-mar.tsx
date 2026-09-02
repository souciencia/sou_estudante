/**
 * Átomo BandaMar — banda de onda do fundo do card, TRANSPLANTE VERBATIM
 * do marFundo do v21 (docs/, l.2150-2156): construção dos paths w1/w2,
 * viewBox 240×80, preserveAspectRatio="none" e opacidades .07/.12
 * exatamente como no protótipo; CSS na classe .card-mar (globals.css).
 * A neblina (estado novo) usa a MESMA geometria e as MESMAS opacidades,
 * com cor neutra — nunca mais chamativa que as 5 faixas.
 */
import { paletaMar, parametrosMar } from '@/lib/mar-enade'

// src/components/atoms/enade/banda-mar.tsx
export default function BandaMar({ faixa }: { faixa: number | 'SC' | null }) {
  const numerica = typeof faixa === 'number' ? faixa : null
  const P = parametrosMar(numerica)
  // col do v21: en>=4 → s-ok · en===3 → s-md · senão s-bad
  const col = paletaMar(numerica).cor
  // w1 verbatim: M -wl … Q meio … -wl+wl, T em (i+1)*wl
  const w1 =
    `M ${-P.wl} ${P.yb + 4} Q ${-P.wl + P.wl / 2} ${P.yb + 4 - P.a * 1.4} ${-P.wl + P.wl} ${P.yb + 4}` +
    Array.from(
      { length: Math.ceil(260 / P.wl) + 2 },
      (_, i) => ` T ${(i + 1) * P.wl} ${P.yb + 4}`,
    ).join('') +
    ' L 260 90 L -60 90 Z'
  // w2 verbatim: M -1.5wl … Q … , T em (i+1)*wl - wl/2
  const w2 =
    `M ${-P.wl * 1.5} ${P.yf + 4} Q ${-P.wl * 1.5 + P.wl / 2} ${P.yf + 4 - P.a * 1.8} ${-P.wl * 1.5 + P.wl} ${P.yf + 4}` +
    Array.from(
      { length: Math.ceil(260 / P.wl) + 2 },
      (_, i) => ` T ${(i + 1) * P.wl - P.wl / 2} ${P.yf + 4}`,
    ).join('') +
    ' L 260 90 L -60 90 Z'
  return (
    <div className="card-mar" style={{ color: col }} aria-hidden>
      <svg viewBox="0 0 240 80" preserveAspectRatio="none" aria-hidden="true">
        <path d={w1} fill="currentColor" opacity=".07" />
        <path d={w2} fill="currentColor" opacity=".12" />
      </svg>
    </div>
  )
}
