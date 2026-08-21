/**
 * Átomo OndasEnade — as duas ondas de fundo do selo do Enade, portadas
 * do v21. Estático nos cards; animado SÓ no detalhe (padrão v21) via
 * `animado` — deriva por transform (.mar-onda), prefers-reduced-motion
 * respeitado globalmente pelos tokens.
 */
import { caminhoOnda, type ParamsMar } from "@/lib/mar-enade";

// src/components/atoms/enade/ondas-enade.tsx
export default function OndasEnade({
  params,
  animado = false,
}: {
  params: ParamsMar;
  animado?: boolean;
}) {
  const classeOnda = animado ? "mar-onda" : "";

  return (
    <>
      <g
        className={classeOnda}
        style={{ "--mar-dur": "16s", "--mar-shift": `${-params.wl}px` } as React.CSSProperties}
      >
        <path
          d={caminhoOnda(params.yb, params.a, params.wl)}
          fill="currentColor"
          opacity=".13"
        />
      </g>
      <g
        className={classeOnda}
        style={{ "--mar-dur": "9s", "--mar-shift": `${-params.wl}px` } as React.CSSProperties}
      >
        <path
          d={caminhoOnda(params.yf, params.a * 1.3, params.wl)}
          fill="currentColor"
          opacity=".22"
        />
      </g>
    </>
  );
}
