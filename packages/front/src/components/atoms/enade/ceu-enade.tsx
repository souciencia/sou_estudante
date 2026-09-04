/**
 * Átomo CéuEnade — céu do selo do Enade, portado do v21: sol (faixas 5/4),
 * nuvens (3), nuvens + chuva (2) e neblina (sem avaliação no ciclo / SC).
 * Semântica herdada do pai: o grupo inteiro vive dentro de um `<svg
 * aria-hidden>`, portanto não emite ARIA própria.
 */
import { faixaDoMar } from '@/components/atoms/enade/geometria-mar'

// src/components/atoms/enade/ceu-enade.tsx
export default function CeuEnade({ faixa }: { faixa: number | null }) {
  if (faixa === null) {
    // Neblina: bandas horizontais suaves — sem sol, sem chuva
    return (
      <g fill="currentColor">
        <rect x="36" y="11" width="32" height="3.5" rx="1.75" opacity=".16" />
        <rect x="28" y="18" width="36" height="3.5" rx="1.75" opacity=".26" />
        <rect x="38" y="25" width="28" height="3.5" rx="1.75" opacity=".2" />
        <rect x="24" y="32" width="30" height="3.5" rx="1.75" opacity=".14" />
      </g>
    )
  }

  const fx = faixaDoMar(faixa)

  switch (fx) {
    case 5:
      return (
        <>
          <circle cx="57" cy="17" r="12" fill="currentColor" opacity=".1" />
          <circle cx="57" cy="17" r="6.5" fill="currentColor" opacity=".4" />
        </>
      )

    case 3:
      return (
        <g fill="currentColor" opacity=".28">
          <ellipse cx="55" cy="17" rx="11" ry="6" />
          <ellipse cx="46" cy="20" rx="8" ry="5" />
        </g>
      )

    case 2:
      return (
        <>
          <g fill="currentColor">
            <ellipse cx="53" cy="14" rx="12" ry="6.5" opacity=".42" />
            <ellipse cx="42" cy="17" rx="8" ry="5" opacity=".42" />
          </g>
          <g
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity=".4"
          >
            <line x1="45" y1="25" x2="42" y2="31" />
            <line x1="52" y1="25" x2="49" y2="31" />
            <line x1="59" y1="25" x2="56" y2="31" />
          </g>
        </>
      )

    default:
      // faixa 4 (e outros valores não mapeados): céu limpo, sem sol
      return null
  }
}
