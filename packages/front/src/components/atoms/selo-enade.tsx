/**
 * Átomo SeloEnade — o "mar do Enade" portado do v21 (referência
 * congelada): a faixa do conceito vira condição do mar. Sereno no 5
 * (sol), mar de ondas curtas no 1 e 2 (nuvens e chuva); cores do v21
 * (s-ok / s-md / s-bad).
 *
 * Estado NOVO desta versão: NEBLINA — ausência de conceito, na mesma
 * linguagem da cena (visibilidade reduzida, sem sol nem chuva,
 * não-valorativo, cores neutras dos tokens). Dois rótulos sobre o
 * mesmo visual:
 *   faixa "SC"  → "Sem conceito (SC)"
 *   sem Enade   → "Sem avaliação no ciclo"
 *
 * Estático nos cards; animado SÓ no detalhe (padrão v21) via
 * `animado` — deriva por transform (.mar-onda), prefers-reduced-motion
 * respeitado globalmente pelos tokens.
 */

interface ParamsMar {
  a: number; // amplitude
  wl: number; // comprimento de onda
  yb: number; // y da onda de trás
  yf: number; // y da onda da frente
}

// Parâmetros do v21 (MAR_P); faixa 1 usa os da 2 (marFaixa)
const MAR_P: Record<number, ParamsMar> = {
  5: { a: 1.1, wl: 40, yb: 57, yf: 64 },
  4: { a: 2.4, wl: 28, yb: 55, yf: 63 },
  3: { a: 4, wl: 22, yb: 53, yf: 62 },
  2: { a: 6.5, wl: 16, yb: 49, yf: 60 },
};
const NEBLINA_P: ParamsMar = { a: 2, wl: 30, yb: 55, yf: 63 };

const CORES: Record<string, { cor: string; fundo: string }> = {
  ok: { cor: "#1B8A5A", fundo: "#E8F7F0" }, // faixas 5 e 4
  md: { cor: "#B06000", fundo: "#FFF3E0" }, // faixa 3
  bad: { cor: "#C0392B", fundo: "#FDECEA" }, // faixas 2 e 1
  neblina: { cor: "var(--color-text-muted)", fundo: "var(--color-surface-alt)" },
};

/** Caminho de onda do v21 (marPath). */
function caminhoOnda(y: number, amp: number, wl: number): string {
  let d = `M ${-wl} ${y} Q ${-wl + wl / 4} ${y - amp} ${-wl + wl / 2} ${y}`;
  for (let x = -wl + wl / 2; x < 170; x += wl / 2) {
    d += ` T ${x + wl / 2} ${y}`;
  }
  return d + ` L 180 92 L ${-wl - 10} 92 Z`;
}

export function faixaDoMar(faixa: number): 2 | 3 | 4 | 5 {
  if (faixa >= 5) return 5;
  if (faixa === 4) return 4;
  if (faixa === 3) return 3;
  return 2;
}

function Ceu({ faixa }: { faixa: number | null }) {
  if (faixa === null) {
    // Neblina: bandas horizontais suaves — sem sol, sem chuva
    return (
      <g fill="currentColor">
        <rect x="36" y="11" width="32" height="3.5" rx="1.75" opacity=".16" />
        <rect x="28" y="18" width="36" height="3.5" rx="1.75" opacity=".26" />
        <rect x="38" y="25" width="28" height="3.5" rx="1.75" opacity=".2" />
        <rect x="24" y="32" width="30" height="3.5" rx="1.75" opacity=".14" />
      </g>
    );
  }
  const fx = faixaDoMar(faixa);
  if (fx === 5) {
    return (
      <>
        <circle cx="57" cy="17" r="12" fill="currentColor" opacity=".1" />
        <circle cx="57" cy="17" r="6.5" fill="currentColor" opacity=".4" />
      </>
    );
  }
  if (fx === 3) {
    return (
      <g fill="currentColor" opacity=".28">
        <ellipse cx="55" cy="17" rx="11" ry="6" />
        <ellipse cx="46" cy="20" rx="8" ry="5" />
      </g>
    );
  }
  if (fx === 2) {
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
    );
  }
  return null; // faixa 4: céu limpo, sem sol
}

export interface SeloEnadeProps {
  /** 1–5, "SC" (sem conceito) ou null (sem avaliação no ciclo). */
  faixa: number | "SC" | null;
  /** Deriva das ondas — usar SÓ no detalhe (padrão v21). */
  animado?: boolean;
  tamanho?: "card" | "detalhe";
}

export default function SeloEnade({
  faixa,
  animado = false,
  tamanho = "card",
}: SeloEnadeProps) {
  const numerica = typeof faixa === "number" ? faixa : null;
  const params = numerica === null ? NEBLINA_P : MAR_P[faixaDoMar(numerica)];
  const paleta =
    numerica === null
      ? CORES.neblina
      : numerica >= 4
        ? CORES.ok
        : numerica === 3
          ? CORES.md
          : CORES.bad;
  const rotulo =
    numerica !== null
      ? `Conceito Enade ${numerica} de 5`
      : faixa === "SC"
        ? "Sem conceito (SC)"
        : "Sem avaliação no ciclo";
  const texto = numerica !== null ? String(numerica) : faixa === "SC" ? "SC" : "—";
  const detalhe = tamanho === "detalhe";
  const classeOnda = animado ? "mar-onda" : "";

  return (
    <div
      role="img"
      aria-label={rotulo}
      title={rotulo}
      className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden ${
        detalhe ? "h-20 w-20 rounded-[20px]" : "h-10 w-10 rounded-[10px]"
      }`}
      style={{ background: paleta.fundo, color: paleta.cor }}
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 80 80"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
      >
        <Ceu faixa={numerica} />
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
      </svg>
      {/* Detalhe (v21 .esb-num/.esb-lbl): 2.25rem + "de 5" */}
      <div
        className={`relative z-[1] font-mono font-bold leading-none ${
          detalhe
            ? numerica !== null
              ? "text-[2.25rem]"
              : "text-[1.4rem]"
            : numerica !== null
              ? "text-xl"
              : "text-sm"
        }`}
      >
        {texto}
      </div>
      <div
        className={`relative z-[1] font-semibold ${
          detalhe ? "mt-[2px] text-[10px]" : "mt-px text-[8px] tracking-[0.3px]"
        }`}
      >
        {detalhe && numerica !== null ? "de 5" : "Enade"}
      </div>
    </div>
  );
}

/**
 * Banda de onda do fundo do card — TRANSPLANTE VERBATIM do marFundo
 * do v21 (docs/, l.2150-2156): construção dos paths w1/w2, viewBox
 * 240×80, preserveAspectRatio="none" e opacidades .07/.12 exatamente
 * como no protótipo; CSS na classe .card-mar (globals.css).
 * A neblina (estado novo) usa a MESMA geometria e as MESMAS
 * opacidades, com cor neutra — nunca mais chamativa que as 5 faixas.
 */
export function BandaMar({ faixa }: { faixa: number | "SC" | null }) {
  const numerica = typeof faixa === "number" ? faixa : null;
  const P = numerica === null ? NEBLINA_P : MAR_P[faixaDoMar(numerica)];
  // col do v21: en>=4 → s-ok · en===3 → s-md · senão s-bad
  const col =
    numerica === null
      ? "var(--color-text-muted)"
      : numerica >= 4
        ? CORES.ok.cor
        : numerica === 3
          ? CORES.md.cor
          : CORES.bad.cor;
  // w1 verbatim: M -wl … Q meio … -wl+wl, T em (i+1)*wl
  const w1 =
    `M ${-P.wl} ${P.yb + 4} Q ${-P.wl + P.wl / 2} ${P.yb + 4 - P.a * 1.4} ${-P.wl + P.wl} ${P.yb + 4}` +
    Array.from(
      { length: Math.ceil(260 / P.wl) + 2 },
      (_, i) => ` T ${(i + 1) * P.wl} ${P.yb + 4}`,
    ).join("") +
    " L 260 90 L -60 90 Z";
  // w2 verbatim: M -1.5wl … Q … , T em (i+1)*wl - wl/2
  const w2 =
    `M ${-P.wl * 1.5} ${P.yf + 4} Q ${-P.wl * 1.5 + P.wl / 2} ${P.yf + 4 - P.a * 1.8} ${-P.wl * 1.5 + P.wl} ${P.yf + 4}` +
    Array.from(
      { length: Math.ceil(260 / P.wl) + 2 },
      (_, i) => ` T ${(i + 1) * P.wl - P.wl / 2} ${P.yf + 4}`,
    ).join("") +
    " L 260 90 L -60 90 Z";
  return (
    <div className="card-mar" style={{ color: col }} aria-hidden>
      <svg viewBox="0 0 240 80" preserveAspectRatio="none">
        <path d={w1} fill="currentColor" opacity=".07" />
        <path d={w2} fill="currentColor" opacity=".12" />
      </svg>
    </div>
  );
}
