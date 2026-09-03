/**
 * Átomo OndasEnade — as duas ondas de fundo do selo do Enade, portadas
 * do v21. Estático nos cards; animado SÓ no detalhe (padrão v21) via
 * `animado` — deriva por transform (.mar-onda), prefers-reduced-motion
 * respeitado globalmente pelos tokens.
 */
<<<<<<< HEAD
import { caminhoOnda, type ParamsMar } from '@/lib/mar-enade'
=======
import { caminhoOnda, type ParamsMar } from "@/lib/mar-enade";
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)

// src/components/atoms/enade/ondas-enade.tsx
export default function OndasEnade({
  params,
  animado = false,
}: {
<<<<<<< HEAD
  params: ParamsMar
  animado?: boolean
}) {
  const classeOnda = animado ? 'mar-onda' : ''
=======
  params: ParamsMar;
  animado?: boolean;
}) {
  const classeOnda = animado ? "mar-onda" : "";
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)

  return (
    <>
      <g
        className={classeOnda}
<<<<<<< HEAD
        style={
          {
            '--mar-dur': '16s',
            '--mar-shift': `${-params.wl}px`,
          } as React.CSSProperties
        }
=======
        style={{ "--mar-dur": "16s", "--mar-shift": `${-params.wl}px` } as React.CSSProperties}
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
      >
        <path
          d={caminhoOnda(params.yb, params.a, params.wl)}
          fill="currentColor"
          opacity=".13"
        />
      </g>
      <g
        className={classeOnda}
<<<<<<< HEAD
        style={
          {
            '--mar-dur': '9s',
            '--mar-shift': `${-params.wl}px`,
          } as React.CSSProperties
        }
=======
        style={{ "--mar-dur": "9s", "--mar-shift": `${-params.wl}px` } as React.CSSProperties}
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
      >
        <path
          d={caminhoOnda(params.yf, params.a * 1.3, params.wl)}
          fill="currentColor"
          opacity=".22"
        />
      </g>
    </>
<<<<<<< HEAD
  )
=======
  );
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
}
