/**
 * Molécula AvisoPolosEaD — aviso "Polos a consultar" (ead-loc-notice
 * do v21), movido da s_m2_local para os resultados (adendo D-M2-3).
 * Renderiza quando a fatia contém ofertas de turno "EAD" (literal
 * confirmado na carga). Informativo: nunca lê como filtro. Corpo
 * alinhado à copy do drawer — o local do M2 vem do Sisu, decisão
 * 30/07; título verbatim. Cores EaD do v21 sem token por ora
 * (pendência na pauta do Lote 2).
 */
interface Props {
  onPorQue: () => void;
}

export default function AvisoPolosEaD({ onPorQue }: Props) {
  return (
    <div className="mb-3 rounded-[20px] border-[1.5px] border-[#FFCC80] bg-[#FFF3E0] p-[1.125rem]">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,141,59,.12)]">
          <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden>
            <circle cx="8" cy="7" r="2.5" stroke="#E65100" strokeWidth="1.3" />
            <path
              d="M8 12C8 12 3.5 9.5 3.5 7C3.5 4.5 5.5 2.5 8 2.5s4.5 2 4.5 4.5C12.5 9.5 8 12 8 12Z"
              stroke="#E65100"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[13px] font-bold text-[#E65100]">
          Polos a consultar
        </span>
      </div>
      <p className="text-xs leading-[1.6] text-[#7A3500]">
        Para cursos EaD, o campus indicado é o registro administrativo da
        oferta no Sisu — os polos de apoio presencial não constam na base
        pública. Confirme o polo mais próximo no site da instituição.{" "}
        <button
          type="button"
          onClick={onPorQue}
          className="cursor-pointer font-semibold underline"
        >
          Por que isso acontece? →
        </button>
      </p>
    </div>
  );
}
