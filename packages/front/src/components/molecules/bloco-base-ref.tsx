/**
 * Molécula BlocoBaseRef — .base-ref do v21 (linhas 1712–1719),
 * "Turmas de referência". Números reais, inclusive zero — a base
 * ausente declara-se nos CARTÕES (D-M3-9), aqui o número fala por
 * si. Microtexto das duas bases verbatim do v21; fonte encurtada
 * para "Censo · {ano}" (D-M3-9, regra editorial 5). null → travessão.
 * Cores rosa do v21 sem token por ora (pauta Lote 2).
 */
interface Props {
  qtIng: number | null;
  qtMat: number | null;
  ano: number | null;
}

const num = new Intl.NumberFormat("pt-BR");
const v = (n: number | null) => (n === null ? "—" : num.format(n));

export default function BlocoBaseRef({ qtIng, qtMat, ano }: Props) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-[20px] border border-plum-100 bg-surface p-4">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        width="20"
        height="20"
        aria-hidden
        className="mt-[2px] shrink-0 text-[#C2185B]"
      >
        <circle cx="7" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="7" r="2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M2.5 16C2.5 13 4.5 11 7 11s4.5 2 4.5 5M12 16c0-2.2 1.2-4 3.5-4S19 13.8 19 16"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <div className="mb-[1px] text-[10px] font-bold uppercase tracking-[0.5px] text-[#880E4F]">
          Turmas de referência
        </div>
        <div className="text-[1.05rem] font-bold text-text">
          <em className="not-italic text-[#C2185B]">{v(qtIng)}</em>{" "}
          ingressantes ·{" "}
          <em className="not-italic text-[#C2185B]">{v(qtMat)}</em> matriculados
          {ano !== null && <> em {ano}</>}
        </div>
        <div className="mt-[2px] text-[10px] text-text-muted">
          Bolsas e cotas usam os ingressantes como base; apoio social e
          atividade extracurricular, os matriculados · Censo
          {ano !== null ? ` · ${ano}` : ""}
        </div>
      </div>
    </div>
  );
}
