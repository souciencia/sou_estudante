/**
 * Molécula SeloEnade — selo do Enade (mar) portado do v21: composição do
 * Céu (CeuEnade), das Ondas (OndasEnade) e do rótulo numérico.
 * A banda de fundo do card vive em BandaMar (atoms/enade).
 */
<<<<<<< HEAD
import CeuEnade from '@/components/atoms/enade/ceu-enade'
import OndasEnade from '@/components/atoms/enade/ondas-enade'
import { paletaMar, parametrosMar } from '@/lib/mar-enade'

export interface SeloEnadeProps {
  faixa: 1 | 2 | 3 | 4 | 5 | 'SC' | null
  animado?: boolean
  tamanho?: 'card' | 'detalhe'
=======
import CeuEnade from "@/components/atoms/enade/ceu-enade";
import OndasEnade from "@/components/atoms/enade/ondas-enade";
import { parametrosMar, paletaMar } from "@/lib/mar-enade";

export interface SeloEnadeProps {
  faixa:  1 | 2 | 3 | 4 | 5 | "SC" | null;
  animado?: boolean;
  tamanho?: "card" | "detalhe";
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
}

export default function SeloEnade({
  faixa,
  animado = false,
<<<<<<< HEAD
  tamanho = 'card',
}: SeloEnadeProps) {
  const numerica = typeof faixa === 'number' ? faixa : null
  const params = parametrosMar(numerica)
  const paleta = paletaMar(numerica)
  const rotulo =
    numerica !== null
      ? `Conceito Enade ${numerica} de 5`
      : faixa === 'SC'
        ? 'Sem conceito (SC)'
        : 'Sem avaliação no ciclo'
  const texto =
    numerica !== null ? String(numerica) : faixa === 'SC' ? 'SC' : '—'
  const detalhe = tamanho === 'detalhe'
=======
  tamanho = "card",
}: SeloEnadeProps) {
  const numerica = typeof faixa === "number" ? faixa : null;
  const params = parametrosMar(numerica);
  const paleta = paletaMar(numerica);
  const rotulo =
    numerica !== null
      ? `Conceito Enade ${numerica} de 5`
      : faixa === "SC"
        ? "Sem conceito (SC)"
        : "Sem avaliação no ciclo";
  const texto = numerica !== null ? String(numerica) : faixa === "SC" ? "SC" : "—";
  const detalhe = tamanho === "detalhe";
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)

  return (
    <div
      role="img"
      aria-label={rotulo}
      title={rotulo}
      className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden ${
<<<<<<< HEAD
        detalhe ? 'h-20 w-20 rounded-[20px]' : 'h-10 w-10 rounded-[10px]'
=======
        detalhe ? "h-20 w-20 rounded-[20px]" : "h-10 w-10 rounded-[10px]"
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
      }`}
      style={{ background: paleta.fundo, color: paleta.cor }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 80 80"
        preserveAspectRatio="xMidYMax slice"
<<<<<<< HEAD
        aria-hidden="true"
=======
        aria-hidden
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
      >
        <CeuEnade faixa={numerica} />
        <OndasEnade params={params} animado={animado} />
      </svg>
      {/* Detalhe (v21 .esb-num/.esb-lbl): 2.25rem + "de 5" */}
      <div
        className={`relative z-[1] font-mono font-bold leading-none ${
          detalhe
            ? numerica !== null
<<<<<<< HEAD
              ? 'text-[2.25rem]'
              : 'text-[1.4rem]'
            : numerica !== null
              ? 'text-xl'
              : 'text-sm'
=======
              ? "text-[2.25rem]"
              : "text-[1.4rem]"
            : numerica !== null
              ? "text-xl"
              : "text-sm"
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
        }`}
      >
        {texto}
      </div>
      <div
        className={`relative z-[1] font-semibold ${
<<<<<<< HEAD
          detalhe ? 'mt-[2px] text-[10px]' : 'mt-px text-[8px] tracking-[0.3px]'
        }`}
      >
        {detalhe && numerica !== null ? 'de 5' : 'Enade'}
      </div>
    </div>
  )
=======
          detalhe ? "mt-[2px] text-[10px]" : "mt-px text-[8px] tracking-[0.3px]"
        }`}
      >
        {detalhe && numerica !== null ? "de 5" : "Enade"}
      </div>
    </div>
  );
>>>>>>> c0f3ba2 (wip integração dos componetes da Mey)
}
